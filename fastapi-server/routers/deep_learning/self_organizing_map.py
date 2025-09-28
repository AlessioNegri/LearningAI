from dotenv import load_dotenv

load_dotenv()

import os

os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import keras
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import pymongo
import tensorflow as tf

from common import utility

from collections import defaultdict
from fastapi import APIRouter, BackgroundTasks, HTTPException, Query, status
from fastapi.responses import FileResponse
from matplotlib import cm
from matplotlib.patches import RegularPolygon
from minisom import MiniSom
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from pydantic import BaseModel
from typing import Annotated, List

# --- Params 

MODELS_DIR : str = './fastapi-server/models'

IMG_DIR_DIR : str = './dataset/deep-learning/som'

X       = None
X_ann   = None
y       = None
ID_ann  = None

som : MiniSom = None

winner_matrix : list = []

frauds : list = []

class FraudModel(BaseModel):
    
    id : int

scaler : MinMaxScaler = MinMaxScaler(feature_range=(0, 1))

router : APIRouter = APIRouter(prefix='/deep-learning/self-organizing-map', tags=['Deep Learning - Self Organizing Map'])

# --- Utility 

def prepare_dataset() -> None:
    """Connect to MongoDB database "LearningAI" and extract the documents from the collection "songs"
    """
    
    global X
    global X_ann
    global y
    global ID_ann
    
    # * Read from MongoDB
    
    mongo_client : pymongo.MongoClient = pymongo.MongoClient(host='mongodb://localhost:27017/')

    database : pymongo.database.Database = mongo_client.get_database('LearningAI')

    credit_card_applications_collection : pymongo.collection.Collection = database.get_collection('credit_card_applications')

    cursor = credit_card_applications_collection.find()
    
    # * Prepare dataset with Pandas

    df : pd.DataFrame = pd.DataFrame(list(cursor))

    df.drop(columns=['_id'], axis=1, inplace=True)
    
    ID_ann  = df.iloc[:, 0:1].values # ? CustomerID
    X_ann   = df.iloc[:, 1:].values # ? A1-A14 + Class
    
    X = df.iloc[:, :-1].values  # ? CustomerID + A1-A14
    y = df.iloc[:, -1].values   # ? Class: 0 => Application Refused, 1 => Application Approved
    
    # >>> Preprocessing
    
    X = scaler.fit_transform(X)
    
    # * Close
    
    cursor.close()
    
    mongo_client.close()

# --- Router 

# >>> GET

@router.get(path='/dataset')
def dataset():
    
    # * Retrieve data from MongoDB dataset
    
    prepare_dataset()
    
    # * JSON
    
    return {}

@router.get(path='/model')
def self_organizing_map():
    
    global som
    global winner_matrix
    
    # * Self Organizing Map
    
    number_samples : int = X.shape[0]
    
    neurons : int = int(np.sqrt(5 * np.sqrt(number_samples)))
    
    sigma : int = int(np.sqrt(neurons ** 2 + neurons ** 2))
    
    som = MiniSom(x=neurons, y=neurons, input_len=X.shape[1], sigma=sigma,
                  learning_rate=0.5, activation_distance='euclidean', topology='hexagonal',
                  random_seed=10)
    
    som.random_weights_init(X)

    som.train_random(data=X, num_iteration=100, verbose=False)
    
    distance_map = som.distance_map().T
    
    # * Chart
    
    f = plt.figure(figsize=(7, 7))

    ax = f.add_subplot(111)
    
    ax.xaxis.label.set_color('white')
    ax.tick_params(axis='x', colors='white')
    ax.tick_params(axis='y', colors='white')

    ax.pcolor(distance_map, cmap='bone') # ? Euclidean distance
    
    markers : list = [ 'o', 's' ]
    
    colors : list = [ 'r', 'g' ]
    
    distance_map = distance_map.T
    
    winner_matrix = [ [ { 'class_0': False, 'class_1': False } for _ in range(distance_map.shape[1]) ] for _ in range(distance_map.shape[0]) ]
    
    for idx, x in enumerate(X):
        
        w = som.winner(x)
        
        ax.plot(w[0] + 0.5, w[1] + 0.5, markers[y[idx]], markeredgecolor=colors[y[idx]], markerfacecolor='None', markersize=10, markeredgewidth=2)
        
        if y[idx] == 0: winner_matrix[w[0]][w[1]]['class_0'] = True
        if y[idx] == 1: winner_matrix[w[0]][w[1]]['class_1'] = True
    
    filename : str = f'{IMG_DIR_DIR}/som.png'
    
    if os.path.exists(filename): os.remove(filename)
    
    f.savefig(filename, transparent=True)
    
    # * JSON
    
    return {}

@router.get(path='/image')
def image():
    
    return FileResponse(path=f'{IMG_DIR_DIR}/som.png', media_type='image/png')

@router.get(path='/frauds', response_model=List[int])
def check_frauds(level : Annotated[int | None, Query(alias='level', title='Level in percentage')] = 95):
    
    global frauds
    
    # * Frauds
    
    distance_map = som.distance_map()
    
    mappings : defaultdict = som.win_map(X)
    
    mapping_list : list = []
    
    for i, row in enumerate(winner_matrix):
        
        for j, col in enumerate(row):
            
            if col['class_0'] and col['class_1'] and distance_map[i,j] > level / 100.0: mapping_list.append(mappings[(i, j)])
    
    if len(mapping_list) == 0: return []
    
    possible_frauds : np.ndarray = np.concatenate(tuple(mapping_list), axis=0)
    
    possible_frauds = scaler.inverse_transform(possible_frauds)
    
    #approval_state : list = [index for index, row in enumerate(scaler.inverse_transform(X)) if float(row[0]) in possible_frauds[:, 0]]
    
    frauds = possible_frauds[:, 0]#[ possible_frauds[idx, 0] for idx, state in enumerate(y[approval_state]) if state == 1 ]
    
    # * JSON
    
    response : list = list()
    
    for value in frauds:
        
        response.append(int(value))
    
    return response

@router.get(path='/neural-network', response_model=List[str])
def neural_network():
    
    global X_ann
    
    # * Artificial Neural Network

    is_fraud = np.zeros(X_ann.shape[0])

    for i in range(X_ann.shape[0]):
        
        is_fraud[i] = 1 if ID_ann[i, 0] in frauds else 0

    ann_scaler = StandardScaler()

    X_ann = ann_scaler.fit_transform(X_ann)

    ann = keras.models.Sequential()

    ann.add(keras.layers.Input(shape=(15,)))
    ann.add(keras.layers.Dense(units=2, activation='relu', kernel_initializer='uniform'))
    ann.add(keras.layers.Dense(units=1, activation='sigmoid', kernel_initializer='uniform'))

    ann.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

    ann.fit(x=X_ann, y=is_fraud, batch_size=1, epochs=2)

    y_pred = ann.predict(X_ann)
    y_pred = np.concatenate((ID_ann, y_pred), axis=1)
    y_pred = y_pred[y_pred[:, 1].argsort()]

    
    # * JSON
    
    response : list = list()
    
    for idx, value in enumerate(y_pred):
        
        if is_fraud[idx]: response.append(f'{int(value[0])} - {(value[1] * 100.0):.2f} %')
    
    return response