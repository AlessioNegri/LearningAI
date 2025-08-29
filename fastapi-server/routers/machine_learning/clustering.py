import numpy as np
import pandas as pd
import pymongo

from common import utility

from fastapi import APIRouter, Query
from pydantic import BaseModel
from sklearn.cluster import KMeans, AgglomerativeClustering
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from typing import Annotated, List

# --- Parmas 
    
X           = None
X_original  = None

router : APIRouter = APIRouter(prefix='/machine-learning/clustering', tags=['Machine Learning - Clustering'])

class Data(BaseModel):
    
    CulmenLength    : float
    CulmenDepth     : float
    FlipperLength   : float
    BodyMass        : float
    Sex             : str   # ? MALE, FEMALE
    Cluster         : int

# --- Utility 

def prepare_dataset() -> list:
    """Connect to MongoDB database "LearningAI" and extract the documents from the collection "penguins"

    Returns:
        list: [data]
    """
    
    global X
    global X_original
    
    # * Read from MongoDB
    
    mongo_client : pymongo.MongoClient = pymongo.MongoClient(host='mongodb://localhost:27017/')

    database : pymongo.database.Database = mongo_client.get_database('LearningAI')

    penguins_collection : pymongo.collection.Collection = database.get_collection('penguins')

    cursor = penguins_collection.find()
    
    # * Prepare data
    
    original_data = list(cursor)
    
    temp : pd.DataFrame = pd.DataFrame(original_data)
    
    temp = temp.drop(columns=['_id'], axis=1)
    
    temp['flipper_length_mm']   = temp['flipper_length_mm'].astype('float')
    temp['body_mass_g']         = temp['body_mass_g'].astype('float')
    temp['sex']                 = temp['sex'].astype('str')
    
    temp['Cluster'] = pd.Series(np.zeros(shape=temp['sex'].shape))
    
    temp = temp.rename(columns={'culmen_length_mm': 'CulmenLength',
                                'culmen_depth_mm': 'CulmenDepth',
                                'flipper_length_mm': 'FlipperLength',
                                'body_mass_g': 'BodyMass',
                                'sex': 'Sex'})
    
    data = temp.to_dict(orient='records')
    
    # * Prepare dataset with Pandas

    df : pd.DataFrame = pd.DataFrame(original_data)

    df = df.drop(columns=['_id'], axis=1)
    
    df['flipper_length_mm'] = df['flipper_length_mm'].astype('float')
    df['body_mass_g']       = df['body_mass_g'].astype('float')
    df['sex']               = df['sex'].astype('str')
    
    # >>> Encoding

    X_original = df.iloc[:, :].values

    ct = ColumnTransformer(transformers=[('encoder', OneHotEncoder(), ['sex'])], remainder='passthrough')

    df = pd.DataFrame(ct.fit_transform(df), columns=ct.get_feature_names_out())

    X = df.iloc[:, 2:].values # ? Skip sex from encoder
    
    # * Close
    
    cursor.close()
    
    mongo_client.close()
    
    return data

# --- Router 

@router.get(path="/dataset", response_model=List[Data])
def dataset():
    
    # * Retrieve data from MongoDB dataset
    
    data = prepare_dataset()
    
    # * JSON
    
    return data

@router.get(path="/k-means-clustering", response_model=List[Data])
def k_means_clustering(clusters : Annotated[int | None, Query(alias='clusters', title='# Clusters >= 1')] = 2):
    
    # * Training
    
    model = KMeans(n_clusters=clusters, init='k-means++', n_init='auto', random_state=42)
    
    values = model.fit_predict(X)
    
    values = np.expand_dims(values, axis=1)

    # * JSON
    
    data : np.ndarray = X_original
    
    data = np.hstack((data, values))
    
    response : list = list()
    
    for value in data:
        
        response.append(
            {
                "CulmenLength": value[0],
                "CulmenDepth": value[1],
                "FlipperLength": value[2],
                "BodyMass": value[3],
                "Sex": value[4],
                "Cluster": value[5]
            })

    return response

@router.get(path="/hierarchical-clustering", response_model=List[Data])
def hierarchical_clustering(clusters : Annotated[int | None, Query(alias='clusters', title='# Clusters >= 1')] = 2):
    
    # * Training
    
    model = AgglomerativeClustering(n_clusters=clusters, metric='euclidean', linkage='ward')
    
    values = model.fit_predict(X)
    
    values = np.expand_dims(values, axis=1)

    # * JSON
    
    data : np.ndarray = X_original
    
    data = np.hstack((data, values))
    
    response : list = list()
    
    for value in data:
        
        response.append(
            {
                "CulmenLength": value[0],
                "CulmenDepth": value[1],
                "FlipperLength": value[2],
                "BodyMass": value[3],
                "Sex": value[4],
                "Cluster": value[5]
            })

    return response