from dotenv import load_dotenv

load_dotenv()

import os

os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import datetime as dt
import keras as ks
import numpy as np
import pandas as pd
import pymongo as pm

from common import utility

from fastapi import APIRouter, BackgroundTasks, Query, status
from pydantic import BaseModel
from sklearn.preprocessing import MinMaxScaler
from typing import Annotated, List

# --- Parmas 

MODELS_DIR : str = './fastapi-server/models'

X       = None
X_train = None
X_test  = None
y       = None
y_train = None
y_test  = None

df : pd.DataFrame = None

test_set : np.ndarray = None

test_dates : np.ndarray = None

scaler : MinMaxScaler = None

window : int = 60

rnn : ks.models.Sequential = None

class InfoData:
    
    stopped     : bool  = False
    trained     : bool  = False
    epoch_count : int   = 1
    epochs      : int   = 1

class InfoModel(BaseModel):
    
    stopped     : bool
    trained     : bool
    epoch_count : int
    epochs      : int

class PointData(BaseModel):
    
    x: str
    y: float

class Predictions(BaseModel):
    
    name    : str
    points  : List[PointData]

info_data : InfoData = InfoData()

router : APIRouter = APIRouter(prefix='/deep-learning/recurrent-neural-network', tags=['Deep Learning - Recurrent Neural Network'])

class FitCallback(ks.callbacks.Callback):
    """Callback function used in Keras "fit" method
    
    https://keras.io/api/callbacks/backup_and_restore/
    """
    
    # >>> Override
    def on_epoch_end(self, epoch : int, logs : dict = None):
        
        global info_data
        
        info_data.epoch_count += 1
        
        if info_data.stopped:
            
            info_data.stopped       = False
            info_data.epoch_count   = 1
            
            raise RuntimeError('Interrupting!')

# --- Utility

def format_date(data : np.ndarray) -> np.ndarray:
    """Format the date received from the database

    Args:
        data (np.ndarray): Database data

    Returns:
        np.ndarray: List of date strings
    """
    
    return [str(date) for date in np.datetime_as_string(arr=data, unit='D')]

def prepare_dataset() -> None:
    """Connect to MongoDB database "LearningAI" and extract the documents from the collection "nflx"
    """
    
    global X
    global X_train
    global X_test
    global y
    global y_train
    global y_test
    global df
    global test_dates
    global test_set
    global scaler
    global window
    
    # * Read from MongoDB
    
    mongo_client : pm.MongoClient = pm.MongoClient(host='mongodb://localhost:27017/')

    database : pm.database.Database = mongo_client.get_database('LearningAI')

    nflx_collection : pm.collection.Collection = database.get_collection('nflx')

    cursor = nflx_collection.find()
    
    # * Prepare dataset with Pandas

    df = pd.DataFrame(list(cursor))

    df = df.drop(columns=['_id'])
    
    # * Data
    
    X = format_date(df.iloc[:, 0:1].values[:, 0])
    
    y = df.iloc[:, 1:2].values
    
    # * Dataset
    
    # >>> Training

    training_dates : np.ndarray = format_date(df[df['Date'] < '2023-01-01'].iloc[:, 0:1].values[:, 0])

    training_set : np.ndarray = df[df['Date'] < '2023-01-01'].iloc[:, 1:2].values # ? Open Value

    # >>> Test

    test_dates = format_date(df[df['Date'] >= '2023-01-01'].iloc[:, 0:1].values[:, 0])

    test_set = df[df['Date'] >= '2023-01-01'].iloc[:, 1:2].values # ? Open Value
    
    # >>> Scaling

    scaler = MinMaxScaler(feature_range=(0, 1))

    training_set_scaled : np.ndarray = scaler.fit_transform(training_set)
    
    # >>> Preparation

    X_train = list()
    y_train = list()

    window = 60

    for i in range(window, training_set_scaled.shape[0]):
        
        X_train.append(training_set_scaled[i - window : i, 0])
        y_train.append(training_set_scaled[i, 0])

    X_train = np.array(X_train) # ? List of window-size elements
    y_train = np.array(y_train)
    X_train = np.reshape(X_train, (X_train.shape[0], X_train.shape[1], 1)) # ? Add a third size
    
    # * Close
    
    cursor.close()
    
    mongo_client.close()

def train_model(batch_size : int = 32, epochs : int = 100):
    """Train the Recurrent Neural Network (RNN)
    
    Args:
        batch_size (int, optional): Size of the batch. Defaults to 32.
        epochs (int, optional): Training epochs. Defaults to 100.
    """
    
    global rnn
    global info_data
    
    info_data.trained   = False
    info_data.epochs    = epochs
    
    # * Create the Recurrent Neural Network
    
    rnn = ks.models.Sequential()
    
    rnn.add(ks.layers.Input(shape=(X_train.shape[1], 1))) # ! shape[0] = window
    
    rnn.add(ks.layers.LSTM(units=50, return_sequences=True))
    rnn.add(ks.layers.Dropout(rate=0.2))
    
    rnn.add(ks.layers.LSTM(units=50, return_sequences=True))
    rnn.add(ks.layers.Dropout(rate=0.2))
    
    rnn.add(ks.layers.LSTM(units=50, return_sequences=True))
    rnn.add(ks.layers.Dropout(rate=0.2))
    
    rnn.add(ks.layers.LSTM(units=50))
    rnn.add(ks.layers.Dropout(rate=0.2))
    
    rnn.add(ks.layers.Dense(units=1))
    
    # * Train

    rnn.compile(optimizer='adam', loss='mean_squared_error')
    
    try:

        rnn.fit(x=X_train, y=y_train, batch_size=batch_size, epochs=epochs, callbacks=[FitCallback()])
        
        info_data.trained       = True
        info_data.epoch_count   = 1
        
        # * Save the model
        
        model_path : str = f'{MODELS_DIR}/nflx-bs_{batch_size}-epochs_{epochs}.keras'
        
        if os.path.exists(model_path): os.remove(model_path)
            
        rnn.save(model_path)
    
    except:
        
        info_data.trained = False


# --- Router 

# >>> GET

@router.get(path='/dataset', response_model=List[PointData])
def dataset():
    
    # * Retrieve data from MongoDB dataset
    
    prepare_dataset()
    
    # * JSON
    
    response : list = list()
    
    for x_value, y_value in zip(X, y):
        
        response.append({ "x": x_value, "y": float(y_value) })
    
    return response

@router.get(path='/predictions', response_model=List[Predictions])
def predictions():
    
    predicted_values : list = list()
    
    for id, filename in enumerate(sorted(os.listdir(MODELS_DIR))):
        
        if not filename.startswith('nflx'): continue
        
        rnn_model : ks.Model = ks.saving.load_model(MODELS_DIR + '/' + filename)
        
        inputs = df['Open'].iloc[df.shape[0] - test_set.shape[0] - window :].values
        inputs = inputs.reshape(-1, 1)
        inputs = scaler.transform(inputs)

        X_test = list()

        for i in range(window, window + test_set.shape[0]):
            
            X_test.append(inputs[i - window : i, 0])

        X_test = np.array(X_test)
        X_test = np.reshape(X_test, (X_test.shape[0], X_test.shape[1], 1))

        prediction : np.ndarray = scaler.inverse_transform(rnn_model.predict(X_test))
        
        points : list = list()
    
        for x_value, y_value in zip(test_dates, prediction):
        
            points.append({ "x": x_value, "y": float(y_value) })
        
        predicted_values.append(dict(name=filename, points=points))
    
    return predicted_values

@router.get(path='/train')
def train(background_tasks : BackgroundTasks,
          batch_size : Annotated[int | None, Query(alias='batch_size', title='Batch Size >= 8')] = 32,
          epochs : Annotated[int | None, Query(alias='epochs', title='Epochs >= 1')] = 100):
    
    # * Train ANN
    
    background_tasks.add_task(train_model, batch_size, epochs)
    
    # * JSON
    
    return {}

@router.get(path='/status', response_model=InfoModel)
def model_status():
    
    return info_data

# >>> PUT

@router.put(path='/stop-training', status_code=status.HTTP_200_OK)
def stop_training():
    
    global info_data
    
    info_data.trained   = False
    info_data.stopped   = True
    
    return {}