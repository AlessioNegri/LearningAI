from dotenv import load_dotenv

load_dotenv()

import os

os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import keras
import numpy as np
import pandas as pd
import pymongo
import tensorflow as tf

from common import utility

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query, status
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, TargetEncoder
from pydantic import BaseModel
from typing import Annotated, List

# --- Params 

MODELS_DIR : str = './fastapi-server/models'

X       = None
X_train = None
X_test  = None
y       = None
y_train = None
y_test  = None

ann : keras.Model = None

class InfoData:
    
    stop        : bool  = False
    trained     : bool  = False
    epoch_count : int   = 1
    epochs      : int   = 1
    accuracy    : float = 0.0
    loss        : float = 0.0

class InfoModel(BaseModel):
    
    stop        : bool
    trained     : bool
    epoch_count : int
    epochs      : int
    accuracy    : float
    loss        : float

class AnnModel(BaseModel):
    
    id      : int
    name    : str

class MetricsModel(AnnModel):
    
    accuracy    : float
    f1          : List[float]
    precision   : List[float]
    recall      : List[float]

info_data : InfoData = InfoData()

router : APIRouter = APIRouter(prefix='/deep-learning/artificial-neural-network', tags=['Deep Learning - Artificial Neural Network'])

class FitCallback(keras.callbacks.Callback):
    """Callback function used in Keras "fit" method
    
    https://keras.io/api/callbacks/backup_and_restore/
    """
    
    # >>> Override
    def on_epoch_end(self, epoch : int, logs : dict = None):
        
        global info_data
        
        info_data.epoch_count += 1
        
        if info_data.stop:
            
            info_data.stop          = False
            info_data.epoch_count   = 1
            info_data.accuracy      = logs['accuracy']
            info_data.loss          = logs['loss']
            
            raise RuntimeError('Interrupting!')

# --- Utility 

def prepare_dataset() -> None:
    """Connect to MongoDB database "LearningAI" and extract the documents from the collection "songs"
    """
    
    global X
    global X_train
    global X_test
    global y
    global y_train
    global y_test
    
    # * Read from MongoDB
    
    mongo_client : pymongo.MongoClient = pymongo.MongoClient(host='mongodb://localhost:27017/')

    database : pymongo.database.Database = mongo_client.get_database('LearningAI')

    songs_collection : pymongo.collection.Collection = database.get_collection('songs')

    cursor = songs_collection.find()
    
    # * Prepare dataset with Pandas

    df : pd.DataFrame = pd.DataFrame(list(cursor))

    df.drop(columns=['_id'], axis=1, inplace=True)
    
    # >>> Convert variables from int type to float type

    num_cols = df.select_dtypes(include=['int']).columns.to_list()

    for col in num_cols: df[col] = df[col].astype(float)

    # >>> Convert variables from object type to category type

    cat_cols = df.select_dtypes(include=['object']).columns.to_list()

    for col in cat_cols: df[col] = df[col].astype('category')

    # >>> Popularity: 0 = low, 1 = medium, 2 = high

    df['class'] = pd.qcut(df['popularity'], q=3, labels=[0, 1, 2]) # ? q=3 --> each bin will contain 33% of the data

    df.drop('popularity', axis=1, inplace=True)
    
    # >>> Preprocessing

    X = df.iloc[:, :-1]
    y = df.iloc[:, -1].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=123, stratify=y)

    ct = ColumnTransformer(transformers=[('encoder', TargetEncoder(), X_train.select_dtypes(include=['category']).columns.to_list()),
                                         ('scaler', StandardScaler(), X_train.select_dtypes(include=['float']).columns.to_list())],
                           remainder='passthrough',
                           verbose_feature_names_out=False).set_output(transform='pandas')

    X_train = ct.fit_transform(X_train, y_train)
    X_test  = ct.transform(X_test)

    X_train = X_train.values
    X_test  = X_test.values
    y_train = y_train.values
    y_test  = y_test.values
    
    # * Close
    
    cursor.close()
    
    mongo_client.close()

def train_model(batch_size : int = 16, epochs : int = 10):
    """Train the Artificial Neural Network (ANN)

    Args:
        batch_size (int, optional): Size of the batch. Defaults to 16.
        epochs (int, optional): Training epochs. Defaults to 10.
    """
    
    global ann
    global info_data
    
    info_data.trained   = False
    info_data.epochs    = epochs
    
    # * Convert data to tensor
    
    X_train_tf  = tf.convert_to_tensor(X_train)
    X_test_tf   = tf.convert_to_tensor(X_test)
    y_train_tf  = tf.convert_to_tensor(y_train)
    y_test_tf   = tf.convert_to_tensor(y_test)
    
    # * Create the Artificial Neural Network
    
    input_layer = keras.layers.Input(shape=(X_train_tf.shape[1], ))
    
    x = keras.layers.Dense(units=20, activation='relu')(input_layer)    # ? 20 neurons
    x = keras.layers.Dense(units=20, activation='relu')(x)              # ? 20 neurons
    
    output_layer = keras.layers.Dense(units=3, activation='softmax')(x)    # ? 3 neurons for the 3 classes
    
    ann = keras.Model(inputs=input_layer, outputs=output_layer, name='model_dense_multiclass')
    
    # * Train
    
    ann.compile(optimizer=keras.optimizers.Adam(learning_rate=10e-4), loss=keras.losses.SparseCategoricalCrossentropy(), metrics=['accuracy'])
    
    try:
    
        ann.fit(x=X_train_tf, y=y_train_tf, batch_size=batch_size, epochs=epochs, validation_data=(X_test_tf, y_test_tf), callbacks=[FitCallback()])
        
        info_data.trained       = True
        info_data.epoch_count   = 1
        
        # * Save the model
        
        model_path : str = f'{MODELS_DIR}/songs-bs_{batch_size}-epochs_{epochs}.keras'
        
        if os.path.exists(model_path): os.remove(model_path)
            
        ann.save(model_path)
    
    except:
        
        info_data.trained = False

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
          batch_size : Annotated[int | None, Query(alias='batch_size', title='Batch Size >= 8')] = 16,
          epochs : Annotated[int | None, Query(alias='epochs', title='Epochs >= 1')] = 10):
    
    # * Train ANN
    
    background_tasks.add_task(train_model, batch_size, epochs)
    
    # * JSON
    
    return {}

@router.get(path='/status', response_model=InfoModel)
def model_status():
    
    return info_data

@router.get(path='/models', response_model=List[AnnModel])
def models():
    
    models_structure : list = []
    
    for id, filename in enumerate(sorted(os.listdir(MODELS_DIR))):
        
        if not filename.startswith('songs'): continue
        
        models_structure.append(dict(id=id, name=filename))
    
    return models_structure

@router.get(path='/metrics', response_model=List[MetricsModel], status_code=status.HTTP_200_OK)
def metrics():
    
    metrics_list : list = []
    
    for id, filename in enumerate(sorted(os.listdir(MODELS_DIR))):
        
        if not filename.startswith('songs'): continue
    
        ann_model : keras.Model = keras.saving.load_model(MODELS_DIR + '/' + filename)
        
        y_pred : np.ndarray = ann_model.predict(X_test) # ? List of best matches for each element
        
        y_pred = [np.argmax(prob) for prob in y_pred] # ? Choose the most likely ones
        
        metrics_list.append(dict(id=id,
                                 name=filename,
                                 accuracy=accuracy_score(y_test, y_pred),
                                 f1=f1_score(y_test, y_pred, average=None),
                                 precision=precision_score(y_test, y_pred, average=None),
                                 recall=recall_score(y_test, y_pred, average=None)))
    
    return metrics_list

# >>> PUT

@router.put(path='/stop-training', status_code=status.HTTP_200_OK)
def stop_training():
    
    global info_data
    
    info_data.trained   = False
    info_data.stop      = True
    
    return {}

# >>> DELETE

@router.delete(path='/models/{model_name}', status_code=status.HTTP_200_OK)
def remove_model(model_name : str):
    
    model_path = f'${MODELS_DIR}/' + model_name
    
    if not os.path.exists(model_path):
        
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'The model {model_path} has not been found')
    
    os.remove(model_path)
    
    return {}