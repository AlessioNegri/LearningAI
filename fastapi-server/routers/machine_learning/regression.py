import datetime as dt
import pandas as pd
import pymongo

from common import utility

from fastapi import APIRouter, Query
from pydantic import BaseModel
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.svm import SVR
from sklearn.tree import DecisionTreeRegressor
from typing import Annotated, List

# --- Parmas 

X       = None
X_train = None
X_test  = None
y       = None
y_train = None
y_test  = None

router : APIRouter = APIRouter(prefix='/machine-learning/regression', tags=['Machine Learning - Regression'])

class InfoData(BaseModel):
    
    name        : str
    columns     : List[int]
    descriptions: List[str]
    
class PointData(BaseModel):
    
    x: str
    y: float

# --- Utility 

def dataset_columns() -> dict:
    """Connect to MongoDB database "LearningAI" and extract the columns from the collection "carbon_emissions"

    Returns:
        list: [columns]
    """
    
    # * Read from MongoDB
    
    mongo_client : pymongo.MongoClient = pymongo.MongoClient(host='mongodb://localhost:27017/')

    database : pymongo.database.Database = mongo_client.get_database('LearningAI')

    carbon_emissions_collection : pymongo.collection.Collection = database.get_collection('carbon_emissions')

    cursor = carbon_emissions_collection.aggregate([{ '$group': { '_id': { 'Column_Order': '$Column_Order', 'Description': '$Description' }, 'count': { '$sum': 1 } } }])
    
    # * Prepare columns with Pandas
    
    items : dict = dict((item['_id']['Column_Order'], item['_id']['Description']) for item in list(cursor))
    
    sorted_items : dict = dict((k, v) for k, v in sorted(items.items(), key=lambda item: item[0]))
    
    # * Close
    
    cursor.close()
    
    mongo_client.close()
    
    return sorted_items

def prepare_dataset(column : int) -> None:
    """Connect to MongoDB database "LearningAI" and extract the documents from the collection "carbon_emissions"

    Args:
        column (int): Specific "column_order" filter
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

    carbon_emissions_collection : pymongo.collection.Collection = database.get_collection('carbon_emissions')

    cursor = carbon_emissions_collection.find({ 'Column_Order': { '$eq': column }, 'YYYYMM': { '$regex': '13$' } })
    
    # * Prepare dataset with Pandas

    df : pd.DataFrame = pd.DataFrame(list(cursor))

    df = df.drop(columns=['_id'])
    
    df['YYYYMM'] = df['YYYYMM'].astype('int64')

    X = df.iloc[:, 1].values.reshape(-1, 1) # * YYYYMM
    y = df.iloc[:, 2].values.reshape(-1, 1) # * Value

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # * Close
    
    cursor.close()
    
    mongo_client.close()

def convert_YYYYMM(YYYYMM : int) -> str:
    """Convert the "YYYYMM" collection field in a datetime string

    Args:
        YYYYMM (int): Collection field

    Returns:
        str: Datetime string
    """
    
    return dt.datetime(year=int(str(YYYYMM).removesuffix("13")), month=1, day=1).strftime("%Y-%m-%d")

# --- Router 

@router.get(path="/info", response_model=InfoData)
def info():
    
    # * Retrieve info data from MongoDB dataset
    
    items : dict = dataset_columns()
    
    # * JSON
    
    response : dict = { "name": "Carbon Emissions", "columns": items.keys(), "descriptions": items.values() }
    
    return response

@router.get(path="/dataset", response_model=List[PointData])
def dataset(column : Annotated[int | None, Query(alias='column', title='Description column >= 1')] = 1):
    
    # * Retrieve data from MongoDB dataset
    
    prepare_dataset(column=column)
    
    # * JSON
    
    response : list = list()
    
    for x_value, y_value in zip(X, y):
        
        response.append({ "x": convert_YYYYMM(x_value[0]), "y": float(y_value[0]) })
    
    return response

@router.get(path="/linear-regression", response_model=List[PointData])
def linear_regression():
    
    # * Training
    
    model = LinearRegression()

    model.fit(X_train, y_train)

    r2 = r2_score(y_test, model.predict(X_test))

    values = model.predict(X)
    
    # * JSON
    
    response : list = list()
    
    for x_value, y_value in zip(X, values):
        
        response.append({ "x": convert_YYYYMM(x_value[0]), "y": float(y_value[0]) })
    
    return response

@router.get(path="/polynomial-regression", response_model=List[PointData])
def polynomial_regression(degree : Annotated[int | None, Query(alias='degree', title='Polynomial degree >= 2')] = 2):
    
    # * Training
    
    features = PolynomialFeatures(degree=degree)

    X_transformed = features.fit_transform(X_train)

    model = LinearRegression()

    model.fit(X_transformed, y_train)

    r2 = r2_score(y_test, model.predict(features.fit_transform(X_test)))
    
    values = model.predict(features.fit_transform(X))

    # * JSON
    
    response : list = list()
    
    for x_value, y_value in zip(X, values):
        
        response.append({ "x": convert_YYYYMM(x_value[0]), "y": float(y_value[0]) })
    
    return response

@router.get(path="/support-vector-regression", response_model=List[PointData])
def support_vector_regression():
    
    # * Training
    
    standard_scaler_X = StandardScaler()
    standard_scaler_y = StandardScaler()

    X_scaled = standard_scaler_X.fit_transform(X_train)
    y_scaled = standard_scaler_y.fit_transform(y_train)

    model = SVR(kernel='rbf')

    model.fit(X_scaled, y_scaled.ravel())

    r2 = r2_score(y_test, standard_scaler_y.inverse_transform(model.predict(standard_scaler_X.transform(X_test).reshape(-1, 1)).reshape(-1, 1)))
    
    values = standard_scaler_y.inverse_transform(model.predict(standard_scaler_X.transform(X).reshape(-1, 1)).reshape(-1, 1))

    # * JSON
    
    response : list = list()
    
    for x_value, y_value in zip(X, values):
        
        response.append({ "x": convert_YYYYMM(x_value[0]), "y": float(y_value[0]) })
    
    return response

@router.get(path="/decision-tree-regression", response_model=List[PointData])
def decision_tree_regression():
    
    # * Training
    
    model = DecisionTreeRegressor(random_state=42)

    model.fit(X_train, y_train)

    r2 = r2_score(y_test, model.predict(X_test))
    
    values = model.predict(X)

    # * JSON
    
    response : list = list()
    
    for x_value, y_value in zip(X, values):
        
        response.append({ "x": convert_YYYYMM(x_value[0]), "y": float(y_value) })
    
    return response

@router.get(path="/random-forest-regression", response_model=List[PointData])
def random_forest_regression(estimators : Annotated[int | None, Query(alias='estimators', title='Number of trees >= 1')] = 10):
    
    if estimators == 0: return list()
    
    # * Training
    
    model = RandomForestRegressor(n_estimators=estimators, random_state=42)

    model.fit(X_train, y_train.ravel())

    r2 = r2_score(y_test, model.predict(X_test))
    
    values = model.predict(X)

    # * JSON
    
    response : list = list()
    
    for x_value, y_value in zip(X, values):
        
        response.append({ "x": convert_YYYYMM(x_value[0]), "y": float(y_value) })
    
    return response