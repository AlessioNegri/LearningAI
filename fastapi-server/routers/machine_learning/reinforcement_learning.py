import numpy as np
import pandas as pd
import pymongo
import random

from common import utility

from collections import Counter
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

# --- Params 

number_rounds : int = 0

number_retailers : int = 0

data_frame : pd.DataFrame = None

router : APIRouter = APIRouter(prefix='/machine-learning/reinforcement-learning', tags=['Machine Learning - Reinforcement Learning'])

class Retailers(BaseModel):
    
    Retailer01: int # ? Vote between 1 and 10
    Retailer02: int
    Retailer03: int
    Retailer04: int
    Retailer05: int
    Retailer06: int
    Retailer07: int
    Retailer08: int

class Result(Retailers):
    
    TotalReward: int

# --- Utility 

def prepare_dataset() -> list:
    """Connect to MongoDB database "LearningAI" and extract the documents from the collection "retailers"
    
    Returns:
        list: [data]
    """
    
    global number_rounds
    global number_retailers
    global data_frame
    
    # * Read from MongoDB
    
    mongo_client : pymongo.MongoClient = pymongo.MongoClient(host='mongodb://localhost:27017/')

    database : pymongo.database.Database = mongo_client.get_database('LearningAI')

    retailers_collection : pymongo.collection.Collection = database.get_collection('retailers')

    cursor = retailers_collection.find()
    
    original_data : list = list(cursor)
    
    df : pd.DataFrame = pd.DataFrame(original_data)
    
    df = df.drop(columns=['_id'], axis=1)
    
    df = (df > 5).astype(int) # ? 1 = Good, 0 = Bad
    
    # * Prepare data
    
    data : list = df.head().to_dict(orient='records')
    
    # * Prepare dataset
    
    number_rounds = df.shape[0]
    
    number_retailers = df.shape[1]
    
    data_frame = df
    
    # * Close
    
    cursor.close()
    
    mongo_client.close()
    
    return data

# --- Router 

@router.get(path="/dataset", response_model=List[Retailers])
def dataset():
    
    # * Retrieve data from MongoDB dataset
    
    data = prepare_dataset()
    
    # * JSON
    
    return data

@router.get(path="/upper-confidence-bound", response_model=Result)
def upper_confidence_bound():
    
    # * Training
    
    retailer_selected           : list = list()
    number_retailer_selected    : list = [0] * number_retailers # ? N_i(n) = # times the retailer i-th was selected up to round n
    sum_of_rewards              : list = [0] * number_retailers # ? R_i(n) = sum of rewards of retailer i-th up to round n

    total_reward : int = 0
    
    # >>> Cycle on rounds

    for n in range(0, number_rounds):
        
        retailer    : int = 0
        max_ucb     : float = 0.0
        ucb         : float = 0.0 # ? Upper Confidence Bound
        
        # >>> Cycle on retailers to find the one with highest UCB
        
        for i in range(0, number_retailers):
            
            if number_retailer_selected[i] > 0:
            
                average_reward  = sum_of_rewards[i] / number_retailer_selected[i] # ? r_i(n) = R_i(n) / N_i(n)
                delta           = np.sqrt(3 / 2 * np.log(n + 1) / number_retailer_selected[i])
                ucb             = average_reward + delta
            
            else:
                
                ucb = 1e400
            
            if ucb > max_ucb:
                
                max_ucb     = ucb
                retailer    = i
        
        # >>> Update data (at first round will select "Retailer01")
        
        retailer_selected.append(retailer)
        
        number_retailer_selected[retailer] += 1
        
        reward : int = int(data_frame.values[n, retailer])
        
        sum_of_rewards[retailer] += reward
        
        total_reward += reward
    
    # * JSON
    
    #hist : Counter = Counter(retailer_selected)
    
    result : dict = dict()
    
    result['TotalReward']   = total_reward
    result['Retailer01']    = sum_of_rewards[0]
    result['Retailer02']    = sum_of_rewards[1]
    result['Retailer03']    = sum_of_rewards[2]
    result['Retailer04']    = sum_of_rewards[3]
    result['Retailer05']    = sum_of_rewards[4]
    result['Retailer06']    = sum_of_rewards[5]
    result['Retailer07']    = sum_of_rewards[6]
    result['Retailer08']    = sum_of_rewards[7]
    
    return result

@router.get(path="/thompson-sampling", response_model=Result)
def thompson_sampling():
    
    # * Training
    
    retailer_selected   : list = list()
    number_of_rewards_1 : list = [0] * number_retailers # ? N_i^1(n) = # times the retailer i-th got reward 1 up to round n
    number_of_rewards_0 : list = [0] * number_retailers # ? N_i^0(n) = # times the retailer i-th got reward 0 up to round n
    sum_of_rewards      : list = [0] * number_retailers

    total_reward : int = 0
    
    # >>> Cycle on rounds

    for n in range(0, number_rounds):
        
        retailer    : int = 0
        max_theta   : float = 0.0
        
        # >>> Cycle on retailers to find the one with highest UCB
        
        for i in range(0, number_retailers):
            
            theta = random.betavariate(number_of_rewards_1[i] + 1, number_of_rewards_0[i] + 1)
            
            if theta > max_theta:
                
                max_theta   = theta
                retailer    = i
        
        # >>> Update data (at first round will select "Retailer01")
        
        retailer_selected.append(retailer)
        
        reward : int = int(data_frame.values[n, retailer])
        
        if reward == 1:
            
            number_of_rewards_1[retailer] += 1
            
        else:
            
            number_of_rewards_0[retailer] += 1
        
        sum_of_rewards[retailer] += reward
        
        total_reward += reward
    
    # * JSON
    
    #hist : Counter = Counter(retailer_selected)
    
    result : dict = dict()
    
    result['TotalReward']   = total_reward
    result['Retailer01']    = sum_of_rewards[0]
    result['Retailer02']    = sum_of_rewards[1]
    result['Retailer03']    = sum_of_rewards[2]
    result['Retailer04']    = sum_of_rewards[3]
    result['Retailer05']    = sum_of_rewards[4]
    result['Retailer06']    = sum_of_rewards[5]
    result['Retailer07']    = sum_of_rewards[6]
    result['Retailer08']    = sum_of_rewards[7]
    
    return result