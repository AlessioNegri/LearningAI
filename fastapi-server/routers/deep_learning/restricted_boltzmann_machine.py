import numpy as np
import os
import pandas as pd
import pymongo
import shutil
import torch

from common import utility

from fastapi import APIRouter, BackgroundTasks, Query, status
from pydantic import BaseModel
from typing import Annotated, List

# --- Params 

MODELS_DIR : str = './fastapi-server/models/rbm'

number_users : int = 0

number_movies : int = 0

training_set = None

test_set = None

class RBM():
    """Restricted Boltzmann Machine (RBM)"""
    
    def __init__(self, num_visible : int, num_hidden : int) -> None:
        """Constructor

        Args:
            num_visible (int): Number of visible nodes
            num_hidden (int): Number of hidden nodes
        """
        
        self.W : torch.Tensor = torch.randn(num_hidden, num_visible)    # * Weights
        self.a : torch.Tensor = torch.randn(1, num_hidden)              # * Hidden a coefficients bias (hidden given visible)
        self.b : torch.Tensor = torch.randn(1, num_visible)             # * Visible b coefficients bias (visible given hidden)
    
    def set_tensors(self, W : torch.Tensor, a : torch.Tensor, b : torch.Tensor) -> None:
        """Set the tensors of the model

        Args:
            W (torch.Tensor): Weights tensor
            a (torch.Tensor): Hidden a coefficients tensor
            b (torch.Tensor): Visible b coefficients tensor
        """
        
        self.W : torch.Tensor = W
        self.a : torch.Tensor = a
        self.b : torch.Tensor = b
    
    def sample_hidden(self, visible : torch.Tensor) -> list:
        """Random sampling of hidden node from visible

        Args:
            visible (torch.Tensor): Visible nodes

        Returns:
            list: [ Probability of hidden given visible, Bernoulli sampling ]
        """
        
        weight_visible : torch.Tensor = torch.mm(visible, self.W.t())
        
        activation : torch.Tensor = weight_visible + self.a.expand_as(weight_visible) # ? Applied to each line of mini-batch
        
        prob_hidden_given_visible : torch.Tensor = torch.sigmoid(activation) # ? e.g. Visible = 1 if the user see a lot of action film => high probability for the hidden node
        
        # ? e.g. prob_hidden_given_visible = 0.7 -> rand (0, 1) => activate the neuron in > 0.7 (1 = Liked) or deactivate it (0 = Not Liked)
        
        return prob_hidden_given_visible, torch.bernoulli(prob_hidden_given_visible)
    
    def sample_visible(self, hidden : torch.Tensor) -> list:
        """Random sampling of visible node from hidden

        Args:
            hidden (torch.Tensor): Hidden nodes

        Returns:
            list: [ Probability of visible given hidden, Bernoulli sampling ]
        """
        
        weight_hidden : torch.Tensor = torch.mm(hidden, self.W)
        
        activation : torch.Tensor = weight_hidden + self.b.expand_as(weight_hidden)
        
        prob_visible_given_hidden : torch.Tensor = torch.sigmoid(activation)
        
        return prob_visible_given_hidden, torch.bernoulli(prob_visible_given_hidden)
    
    def train(self, visible_0 : torch.Tensor, visible_k : torch.Tensor, prob_hidden_0 : torch.Tensor, prob_hidden_k : torch.Tensor) -> None:
        """Training - Log-Likelihood Gradient - K-Step Contrastive Divergence

        Args:
            visible_0 (torch.Tensor): Visible nodes at step 0 (input vector)
            visible_k (torch.Tensor): Visible nodes at step 1 (after k sampling/iterations)
            prob_hidden_0 (torch.Tensor): Probability of hidden nodes at step 0
            prob_hidden_k (torch.Tensor): Probability of hiddem nodes at step k
        """
        
        self.W += torch.mm(visible_0.t(), prob_hidden_0).t() - torch.mm(visible_k.t(), prob_hidden_k).t()
        self.b += torch.sum((visible_0 - visible_k), 0)
        self.a += torch.sum((prob_hidden_0 - prob_hidden_k), 0)

rbm : RBM = None

class InfoData:
    
    stopped     : bool  = False
    trained     : bool  = False
    epoch_count : int   = 1
    epochs      : int   = 1
    loss        : float = 0.0

class InfoModel(BaseModel):
    
    stopped     : bool
    trained     : bool
    epoch_count : int
    epochs      : int
    loss        : float

class MetricsModel(BaseModel):
    
    id      : int
    name    : str
    loss    : float

info_data : InfoData = InfoData()

router : APIRouter = APIRouter(prefix='/deep-learning/restricted-boltzmann-machine', tags=['Deep Learning - Restricted Boltzmann Machine'])

# --- Utility 

def convert(data : np.ndarray) -> list:
    """Convert the full data in a matrix Users - Movies - Ratings (Rows - Columns - Cells)

    Args:
        data (np.ndarray): Original data

    Returns:
        list: Converted data
    """
        
    converted_data : list = []
    
    for user in range(1, number_users + 1):
        
        row : np.ndarray = np.zeros(number_movies, dtype='float') # ? Only seen movies from user will have a rating != 0
        
        movies : np.ndarray = data[data[:, 0] == user][:, 1]
        
        ratings : np.ndarray = data[data[:, 0] == user][:, 2]
        
        row[movies - 1] = ratings # ? -1 to start from index 0
        
        converted_data.append(row.tolist())
    
    return converted_data

def prepare_dataset() -> None:
    """Connect to MongoDB database "LearningAI" and extract the documents from the collection 'movies'"""
    
    global number_users
    global number_movies
    global training_set
    global test_set
    
    # * Read from MongoDB
    
    mongo_client : pymongo.MongoClient = pymongo.MongoClient(host='mongodb://localhost:27017/')

    database : pymongo.database.Database = mongo_client.get_database('LearningAI')

    movies_training_collection : pymongo.collection.Collection = database.get_collection('movies_training')
    
    movies_test_collection : pymongo.collection.Collection = database.get_collection('movies_test')

    cursor_training = movies_training_collection.find()
    
    cursor_test = movies_test_collection.find()
    
    # * Prepare dataset with Pandas

    df_training : pd.DataFrame = pd.DataFrame(list(cursor_training))

    df_training.drop(columns=['_id'], axis=1, inplace=True)
    
    df_test : pd.DataFrame = pd.DataFrame(list(cursor_test))

    df_test.drop(columns=['_id'], axis=1, inplace=True)
    
    training_set    = df_training.to_numpy()
    test_set        = df_test.to_numpy()

    number_users    = max(max(training_set[:, 0]), max(test_set[:, 0]))
    number_movies   = max(max(training_set[:, 1]), max(test_set[:, 1]))

    training_set    = convert(training_set)
    test_set        = convert(test_set)

    # >>> Conversions + Rating Adjustment (-1 = skip, 0 = Not Liked, 1 = Liked)

    training_set    = torch.FloatTensor(training_set)
    test_set        = torch.FloatTensor(test_set)

    training_set[training_set == 0] = -1
    training_set[training_set == 1] = +0
    training_set[training_set == 2] = +0
    training_set[training_set >= 3] = +1

    test_set[test_set == 0] = -1
    test_set[test_set == 1] = +0
    test_set[test_set == 2] = +0
    test_set[test_set >= 3] = +1
    
    # * Close
    
    cursor_training.close()
    
    cursor_test.close()
    
    mongo_client.close()

def train_model(batch_size : int = 100, epochs : int = 10) -> None:
    """Train the Restricted Boltzmann Machine (RBM)
    
    Args:
        batch_size (int, optional): Size of the batch. Defaults to 100.
        epochs (int, optional): Training epochs. Defaults to 10.
    """
    
    global rbm
    global info_data
    
    info_data.trained   = False
    info_data.epochs    = epochs
    
    num_visible : int = len(training_set[0]) # ? Number of users
    num_hidden  : int = 100

    rbm = RBM(num_visible, num_hidden)

    for epoch in range(1, epochs + 1):
        
        train_loss  : int  = 0
        counter     : float = 0.0
        
        for user in range(0, number_users - batch_size, batch_size):
            
            visible_0 : torch.Tensor = training_set[user : user + batch_size]
            visible_k : torch.Tensor = training_set[user : user + batch_size]
            
            prob_hidden_0, _ = rbm.sample_hidden(visible_0)
            
            # * K-Step Contrastive Divergence Learning (random walk)
            
            for _ in range(10):
                
                _, hidden_k     = rbm.sample_hidden(visible_k)
                _, visible_k    = rbm.sample_visible(hidden_k)
                
                # * Maintain the not-seen movies (-1)
                
                visible_k[visible_0 < 0] = visible_0[visible_0 < 0]
            
            prob_hidden_k, _ = rbm.sample_hidden(visible_k)
            
            # * Train
            
            rbm.train(visible_0, visible_k, prob_hidden_0, prob_hidden_k)
            
            train_loss += torch.mean(torch.abs(visible_0[visible_0 >= 0] - visible_k[visible_0 >= 0]))
            
            counter += 1.0
        
        print(f'Epoch {epoch}: loss {train_loss / counter}')
        
        info_data.epoch_count += 1
        
        if info_data.stopped:
            
            info_data.trained       = False
            info_data.epoch_count   = 1
            
            break
    
    if not info_data.stopped:
        
        info_data.trained       = True
        info_data.epoch_count   = 1
        
        # * Save the model
        
        if not os.path.exists(MODELS_DIR): os.mkdir(MODELS_DIR)
        
        model_path : str = f'{MODELS_DIR}/movies-bs_{batch_size}-epochs_{epochs}'
        
        if os.path.exists(model_path): shutil.rmtree(model_path)
        
        os.mkdir(model_path)
        
        torch.save(rbm.W, f'{model_path}/W.pt')
        torch.save(rbm.a, f'{model_path}/a.pt')
        torch.save(rbm.b, f'{model_path}/b.pt')
    
    else:
        
        info_data.stopped = False

def test_model(rbm_model : RBM) -> float:
    """Test the RBM model

    Returns:
        float: Loss value
    """
    
    test_loss   : int = 0
    counter     : float = 0.0

    for user in range(number_users):
        
        visible     : torch.Tensor = training_set[user : user + 1]
        visible_t   : torch.Tensor = test_set[user : user + 1]
        
        # * Blind walk
        
        if len(visible_t[visible_t >= 0]) > 0:
            
            _, hidden   = rbm_model.sample_hidden(visible)
            _, visible  = rbm_model.sample_visible(hidden)
            
            test_loss += torch.mean(torch.abs(visible_t[visible_t >= 0] - visible[visible_t >= 0]))
            
            counter += 1.0

    print(f'Test loss {test_loss / counter}')
    
    return test_loss / counter * 100.0

# --- Router 

# >>> GET

@router.get(path='/dataset')
def dataset():
    
    # * Retrieve data from MongoDB dataset
    
    prepare_dataset()
    
    # * JSON
    
    return {}

@router.get(path='/train')
def train(background_tasks : BackgroundTasks,
          batch_size : Annotated[int | None, Query(alias='batch_size', title='Batch Size >= 8')] = 100,
          epochs : Annotated[int | None, Query(alias='epochs', title='Epochs >= 1')] = 10):
    
    # * Train RBM
    
    background_tasks.add_task(train_model, batch_size, epochs)
    
    # * JSON
    
    return {}

@router.get(path='/test')
def test():
    
    # * Test RBM
    
    test_model(rbm_model=rbm)
    
    # * JSON
    
    return {}

@router.get(path='/status', response_model=InfoModel)
def model_status():
    
    return info_data

@router.get(path='/metrics', response_model=List[MetricsModel], status_code=status.HTTP_200_OK)
def metrics():
    
    metrics_list : list = []
    
    for id, filename in enumerate(sorted(os.listdir(MODELS_DIR))):
        
        if not filename.startswith('movies') or os.path.isfile(f'{MODELS_DIR}/{filename}'): continue
        
        rbm_model : RBM = RBM(0, 0)
        
        rbm_model.set_tensors(torch.load(f'{MODELS_DIR}/{filename}/W.pt'),
                              torch.load(f'{MODELS_DIR}/{filename}/a.pt'),
                              torch.load(f'{MODELS_DIR}/{filename}/b.pt'))
        
        loss : float = test_model(rbm_model=rbm_model)
        
        metrics_list.append(dict(id=id, name=filename, loss=loss))
    
    return metrics_list

# >>> PUT

@router.put(path='/stop-training', status_code=status.HTTP_200_OK)
def stop_training():
    
    global info_data
    
    info_data.stopped = True
    info_data.trained = False
    
    return {}