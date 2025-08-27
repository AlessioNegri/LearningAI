import pandas as pd
import pymongo

from common import utility

from enum import IntEnum
from fastapi import APIRouter, Query
from pydantic import BaseModel
from sklearn.compose import ColumnTransformer
from sklearn.decomposition import PCA, KernelPCA
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis as LDA
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, ConfusionMatrixDisplay
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from typing import Annotated, List

# --- Parmas 
    
X           = None
X_train     = None
X_test      = None
y           = None
y_train     = None
y_test      = None
reduction   = None

router : APIRouter = APIRouter(prefix='/machine-learning/classification', tags=['Machine Learning - Classification'])

class Data(BaseModel):
    
    Age     : int
    Fare    : float
    Sex     : int   # ? 0 = Male, 1 = Female
    Sibsp   : int
    Parch   : int
    Pclass  : int   # ? 1 = 1st, 2 = 2nd, 3 = 3rd
    Embarked: int   # ? 0-C = Cherbourg, 1-Q = Queenstown, 2-S = Southampton
    Survived: bool

class ConfusionMatrix(BaseModel):
    
    TN: int     # ? True-Negative
    FN: int     # ? False-Negative
    FP: int     # ? False-Positive
    TP: int     # ? True-Positive
    AC: float   # ? Accuracy

class DimensionalityReductionType(IntEnum):
        
    PrincipalComponentAnalysis          = 1
    LinearDiscriminantAnalysis          = 2
    KernelPrincipalComponentAnalysis    = 3

class KernelType(IntEnum):
    
    Linear      = 1
    Poly        = 2
    Rbf         = 3
    Sigmoid     = 4
    Precomputed = 5
    
# --- Utility 

def prepare_dataset(method : DimensionalityReductionType) -> list:
    """Connect to MongoDB database "LearningAI" and extract the documents from the collection "titanic"
    
    Args:
        method (DimensionalityReductionType): Method used for dimensionality reduction

    Returns:
        list: [data]
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

    titanic_collection : pymongo.collection.Collection = database.get_collection('titanic')

    cursor = titanic_collection.find()
    
    # * Prepare data
    
    original_data : list = list(cursor)
    
    temp : pd.DataFrame = pd.DataFrame(original_data)
    
    temp['Age'] = temp['Age'].astype('int64')
    
    temp = temp.drop(columns=['_id', 'Passengerid'], axis=1)
    
    data = temp.to_dict(orient='records')
    
    # * Prepare dataset with Pandas

    df : pd.DataFrame = pd.DataFrame(original_data)

    df = df.drop(columns=['_id', 'Passengerid'], axis=1)
    
    # >>> Encoding
    
    features : list = [ 'Sex', 'Sibsp', 'Parch', 'Pclass', 'Embarked' ]

    ct = ColumnTransformer(transformers=[('encoder', OneHotEncoder(), features)], remainder='passthrough')

    df = pd.DataFrame(ct.fit_transform(df), columns=ct.get_feature_names_out())

    X = df.iloc[:, :-1].values
    y = df.iloc[:, -1].values
    
    # >>> Train / Test Split

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # >>> Scaling

    scaler = StandardScaler()

    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)
    
    # >>> Dimensionality Reduction

    match method:
        
        case DimensionalityReductionType.PrincipalComponentAnalysis:
            
            reduction = PCA(n_components=2)
            
            X_train = reduction.fit_transform(X_train)
            X_test = reduction.transform(X_test)
            
        case DimensionalityReductionType.LinearDiscriminantAnalysis:
            
            reduction = LDA(n_components=1)
            
            X_train = reduction.fit_transform(X_train, y_train)
            X_test = reduction.transform(X_test)
            
        case DimensionalityReductionType.KernelPrincipalComponentAnalysis:
            
            reduction = KernelPCA(n_components=2, kernel='rbf')
            
            X_train = reduction.fit_transform(X_train)
            X_test = reduction.transform(X_test)
        
        case _:
            
            pass
    
    # * Close
    
    cursor.close()
    
    mongo_client.close()
    
    return data

def train_and_json(model) -> dict:
    """Train with the given model and prepare the JSON response

    Returns:
        dict: JSON response
    """
    
    if len(X_test[0]) > 1:
        
        return { "TN": 0, "FN": 0, "FP": 0, "TP": 0, "AC": 0.0 }
    
    # * Training

    model.fit(X_train, y_train)
    
    prediction = model.predict(X_test)

    cm = confusion_matrix(y_test, prediction)
    
    accuracy = accuracy_score(y_test, prediction)
    
    #values = model.predict(reduction.transform(X))
    
    # * JSON
    
    return { "TN": int(cm[0][0]), "FN": int(cm[1][0]), "FP": int(cm[0][1]), "TP": int(cm[1][1]), "AC": accuracy }

# --- Router 

@router.get(path="/dataset", response_model=List[Data])
def dataset(method : Annotated[int | None, Query(alias='method', title='Dimensionality Reduction method [1, 2, 3]')] = 2):
    
    # * Retrieve data from MongoDB dataset
    
    data = prepare_dataset(method=method)
    
    # * JSON
    
    return data

@router.get(path="/logistic-regression", response_model=ConfusionMatrix)
def logistic_regression():
    
    model = LogisticRegression()
    
    return train_and_json(model)

@router.get(path="/k-nearest-neighbors", response_model=ConfusionMatrix)
def k_nearest_neighbors(neighbors : Annotated[int | None, Query(alias='neighbors', title='# Neighbours >= 1')] = 5):
    
    model = KNeighborsClassifier(n_neighbors=neighbors, metric='minkowski', p=2) # ! p = 2 => Euclidean

    return train_and_json(model)

@router.get(path="/support-vector-classification", response_model=ConfusionMatrix)
def support_vector_classification(kernel : Annotated[int | None, Query(alias='kernel', title='SVM Kernel [1, 2, 3, 4, 5]')] = 1):
    
    kernel_name = "linear"
    
    match kernel:
        
        case KernelType.Linear:         kernel_name = "linear"
        case KernelType.Poly:           kernel_name = "poly"
        case KernelType.Rbf:            kernel_name = "rbf"
        case KernelType.Sigmoid:        kernel_name = "sigmoid"
        case KernelType.Precomputed:    kernel_name = "precomputed"
    
    model = SVC(kernel=kernel_name, random_state=42)

    return train_and_json(model)

@router.get(path="/naive-bayes", response_model=ConfusionMatrix)
def naive_bayes():
    
    model = GaussianNB()
    
    return train_and_json(model)

@router.get(path="/decision-tree-classification", response_model=ConfusionMatrix)
def decision_tree_classifier():
    
    model = DecisionTreeClassifier(criterion='entropy', random_state=42)
    
    return train_and_json(model)

@router.get(path="/random-forest-classification", response_model=ConfusionMatrix)
def random_forest_classification(estimators : Annotated[int | None, Query(alias='estimators', title='Number of trees >= 1')] = 10):
    
    model = RandomForestClassifier(n_estimators=estimators, criterion='entropy', random_state=42)
    
    return train_and_json(model)