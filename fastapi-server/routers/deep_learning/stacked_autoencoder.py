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

MODELS_DIR : str = './fastapi-server/models/ae'

number_users : int = 0

number_movies : int = 0

training_set = None

test_set = None

class SAE(torch.nn.Module):
    """Stacked Autoencoder (SAE)"""
    
    def __init__(self) -> None:
        """Constructor"""
        
        super(SAE, self).__init__()
        
        self.full_connected_layer_1 : torch.nn.Linear = torch.nn.Linear(in_features=number_movies, out_features=20)
        self.full_connected_layer_2 : torch.nn.Linear = torch.nn.Linear(in_features=20, out_features=10)
        self.full_connected_layer_3 : torch.nn.Linear = torch.nn.Linear(in_features=10, out_features=20)
        self.full_connected_layer_4 : torch.nn.Linear = torch.nn.Linear(in_features=20, out_features=number_movies)
        
        self.activation : torch.nn.Sigmoid = torch.nn.Sigmoid()
    
    def forward(self, x : torch.FloatTensor) -> torch.FloatTensor:
        
        x = self.activation(self.full_connected_layer_1(x))
        x = self.activation(self.full_connected_layer_2(x))
        x = self.activation(self.full_connected_layer_3(x))
        x = self.full_connected_layer_4(x)
        
        return x

sae : SAE = None

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

router : APIRouter = APIRouter(prefix='/deep-learning/stacked-autoencoder', tags=['Deep Learning - Stacked Autoencoder'])

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

    # >>> Conversions

    training_set    = torch.FloatTensor(training_set)
    test_set        = torch.FloatTensor(test_set)
    
    # * Close
    
    cursor_training.close()
    
    cursor_test.close()
    
    mongo_client.close()

def train_model(epochs : int = 200) -> None:
    """Train the Stacked Autoencoder (SAE)
    
    Args:
        epochs (int, optional): Training epochs. Defaults to 200.
    """
    
    global sae
    global info_data
    
    info_data.trained   = False
    info_data.epochs    = epochs

    sae = SAE()
    
    criterion : torch.nn.MSELoss = torch.nn.MSELoss()
    
    optimizer : torch.optim.RMSprop = torch.optim.RMSprop(params=sae.parameters(), lr=0.01, weight_decay=0.5)

    for epoch in range(1, epochs + 1):
        
        train_loss  : int  = 0
        counter     : float = 0.0
        
        for user in range(number_users):
            
            # * Add 1 (fake) dimension for a batch of 1
            
            input_vector : torch.Tensor = torch.autograd.Variable(training_set[user]).unsqueeze(0)
            
            target_vector : torch.Tensor = input_vector.clone()
            
            # * Skip data with no ratings (at least 1 is needed)
            
            if torch.sum(target_vector.data > 0) == 0: continue
            
            # * Call forward
            
            output_vector : torch.Tensor = sae(input_vector)
            
            target_vector.requires_grad = False
            
            # * Keep films not seen as not seen
            
            output_vector[target_vector.data == 0] = 0
            
            loss : torch.Tensor = criterion(output_vector, target_vector)
            
            # * Average of error of movies with a rating != 0
            
            mean_corrector : float = number_movies / float(torch.sum(target_vector.data > 0) + 1e-10)
            
            loss.backward()
            
            train_loss += np.sqrt(loss.data * mean_corrector)
            
            counter += 1.0
            
            optimizer.step()
        
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
        
        model_path : str = f'{MODELS_DIR}/movies-epochs_{epochs}'
        
        if os.path.exists(model_path): shutil.rmtree(model_path)
        
        os.mkdir(model_path)
        
        torch.save(sae.state_dict(), f'{model_path}/state_dict.pt')
    
    else:
        
        info_data.stopped = False

def test_model(sae_model : SAE) -> float:
    """Test the SAE model

    Returns:
        float: Loss value
    """
    
    test_loss   : int = 0
    counter     : float = 0.0
    
    criterion : torch.nn.MSELoss = torch.nn.MSELoss()

    for user in range(number_users):
        
        input_vector  : torch.Tensor = torch.autograd.Variable(training_set[user]).unsqueeze(0)
        target_vector : torch.Tensor = torch.autograd.Variable(test_set[user]).unsqueeze(0)
        
        # * Skip data with no ratings (at least 1 is needed)
            
        if torch.sum(target_vector.data > 0) == 0: continue
        
        output_vector : torch.Tensor = sae_model(input_vector)
        
        target_vector.requires_grad = False
        
        # * Keep films not seen as not seen
        
        output_vector[target_vector.data == 0] = 0
        
        loss : torch.Tensor = criterion(output_vector, target_vector)
        
        # * Average of error of movies with a rating != 0
        
        mean_corrector : float = number_movies / float(torch.sum(target_vector.data > 0) + 1e-10)
        
        test_loss += np.sqrt(loss.data * mean_corrector)
        
        counter += 1.0

    print(f'Test loss {test_loss / counter}')
    
    return test_loss / counter

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
          epochs : Annotated[int | None, Query(alias='epochs', title='Epochs >= 1')] = 200):
    
    # * Train RBM
    
    background_tasks.add_task(train_model, epochs)
    
    # * JSON
    
    return {}

@router.get(path='/test')
def test():
    
    # * Test SAE
    
    test_model(sae_model=sae)
    
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
        
        sae_model : SAE = SAE()
        
        sae_model.load_state_dict(torch.load(f'{MODELS_DIR}/{filename}/state_dict.pt', weights_only=True))
        sae_model.eval()
        
        loss : float = test_model(sae_model=sae_model)
        
        metrics_list.append(dict(id=id, name=filename, loss=loss))
    
    return metrics_list

# >>> PUT

@router.put(path='/stop-training', status_code=status.HTTP_200_OK)
def stop_training():
    
    global info_data
    
    info_data.stopped = True
    info_data.trained = False
    
    return {}