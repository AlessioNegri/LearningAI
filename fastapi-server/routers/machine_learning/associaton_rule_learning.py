import numpy as np
import pandas as pd
import pymongo

from random import randrange

from common import utility

from apyori import apriori
from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional, List, Annotated

# --- Params 

transactions : list = list()

router : APIRouter = APIRouter(prefix='/machine-learning/association-rule-learning', tags=['Machine Learning - Association Rule Learning'])

class Data(BaseModel):
    
    Items: str # ? CSV item list

class BestResult(BaseModel):
    
    Left: str
    Right: str
    Support: float
    Confidence: Optional[float] = None
    Lift: Optional[float] = None

# --- Utility 

def formatAprioriRules(rules) -> list:
    
    left        = [tuple(rule[2][0][0]) for rule in rules]
    right       = [tuple(rule[2][0][1]) for rule in rules]
    support     = [rule[1] for rule in rules]
    confidence  = [rule[2][0][2] for rule in rules]
    lift        = [rule[2][0][3] for rule in rules]
    
    return list(zip(left, right, support, confidence, lift))

def formatEclatRules(rules) -> list:
    
    left        = [tuple(rule[2][0][0]) for rule in rules]
    right       = [tuple(rule[2][0][1]) for rule in rules]
    support     = [rule[1] for rule in rules]
    
    return list(zip(left, right, support))


def prepare_dataset() -> list:
    """Connect to MongoDB database "LearningAI" and extract the documents from the collection "market_basket_optimisation"
    
    Returns:
        list: [data]
    """
    
    global transactions
    
    # * Read from MongoDB
    
    mongo_client : pymongo.MongoClient = pymongo.MongoClient(host='mongodb://localhost:27017/')

    database : pymongo.database.Database = mongo_client.get_database('LearningAI')

    market_basket_optimisation_collection : pymongo.collection.Collection = database.get_collection('market_basket_optimisation')

    cursor = market_basket_optimisation_collection.find()
    
    original_data : list = list(cursor)
    
    df : pd.DataFrame = pd.DataFrame(original_data)
    
    df = df.drop(columns=['_id'], axis=1)
    
    # * Prepare data
    
    data : list = list()
    
    for index, row in df.iterrows():
        
        line : list = list()
        
        for i in range(1, 21):
            
            if type(row[f'Item{i}']) == str: line.append(row[f'Item{i}'])
        
        data.append({ 'Items': ','.join(line) })
    
    # * Prepare dataset
    
    transactions = list()

    for index, row in df.iterrows(): transactions.append([str(item) for item in row])
    
    # * Close
    
    cursor.close()
    
    mongo_client.close()
    
    return data

# --- Router 

@router.get(path="/dataset", response_model=Data)
def dataset():
    
    # * Retrieve data from MongoDB dataset
    
    data = prepare_dataset()
    
    # * JSON
    
    return data[randrange(len(data))]

@router.get(path="/apriori-rules", response_model=List[BestResult])
def apriori_rules(largest : Annotated[int | None, Query(alias='largest', title='Best results [1, 10]')] = 5):
    
    # * Training
    
    rules : list = list(apriori(transactions=transactions, min_support=0.003, min_confidence=0.2, min_lift=3, min_length=2, max_length=3))

    results : pd.DataFrame = pd.DataFrame(data=formatAprioriRules(rules), columns=[ 'Left', 'Right', 'Support', 'Confidence', 'Lift' ])

    results = results.nlargest(n=largest, columns='Lift')

    # * JSON
    
    best_results : list = list()
    
    for index, row in results.iterrows():
        
        best_results.append(
            {
                'Left': str(row['Left']).replace('(', '').replace(')', '').replace('\'', '').removesuffix(','),
                'Right': str(row['Right']).replace('(', '').replace(')', '').replace('\'', '').removesuffix(','),
                'Support': float(row['Support']),
                'Confidence': float(row['Confidence']),
                'Lift': float(row['Lift'])
            })
    
    return best_results

@router.get(path="/eclat-rules", response_model=List[BestResult])
def eclat_rules(largest : Annotated[int | None, Query(alias='largest', title='Best results [1, 10]')] = 5):
    
    # * Training
    
    rules : list = list(apriori(transactions=transactions, min_support=0.003, min_confidence=0.2, min_lift=3, min_length=2, max_length=3))

    results : pd.DataFrame = pd.DataFrame(data=formatEclatRules(rules), columns=[ 'Left', 'Right', 'Support' ])

    results = results.nlargest(n=largest, columns='Support')
    
    # * JSON
    
    best_results : list = list()
    
    for index, row in results.iterrows():
        
        best_results.append(
            {
                'Left': str(row['Left']).replace('(', '').replace(')', '').replace('\'', '').removesuffix(','),
                'Right': str(row['Right']).replace('(', '').replace(')', '').replace('\'', '').removesuffix(','),
                'Support': float(row['Support'])
            })
    
    return best_results