import nltk
import numpy as np
import pandas as pd
import pymongo
import re

from common import utility

#nltk.download('stopwords') # ? Download stopwords in "C:\Users\aless\AppData\Roaming\nltk_data\corpora"

from enum import IntEnum
from fastapi import APIRouter, Query
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
from pydantic import BaseModel
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from typing import Annotated, List, Dict
from xgboost import XGBClassifier

# --- Params 

X       = None
X_train = None
X_test  = None
y       = None
y_train = None
y_test  = None

cv : CountVectorizer = None

model_lr : LogisticRegression = None
model_knn = None
model_svc = None
model_nb = None
model_dt = None
model_rf = None
model_xgb = None

router : APIRouter = APIRouter(prefix='/machine-learning/natural-language-processing', tags=['Machine Learning - Natural Language Processing'])

class GridSearchCVParams(BaseModel):
    
    Score: float
    BestParams: Dict
    
class QualityParams(BaseModel):
    
    TNN: int
    FNn: int
    FNP: int
    FnN: int
    Tnn: int
    FnP: int
    FPN: int
    FPn: int
    TPP: int
    Accuracy: float
    Precision: List[float]
    Recall: List[float]
    F1: List[float]
    KFoldCV: List[float]
    GridSearchCV: GridSearchCVParams

class PredictionResults(BaseModel):
    
    LinearRegression              : int
    KNearestNeighbors             : int
    SupportVectorClassification   : int
    NaiveBayes                    : int
    DecisionTreeClassification    : int
    RandomForestClassification    : int
    XGBoostClassification         : int

class KernelType(IntEnum):
    
    Linear      = 1
    Poly        = 2
    Rbf         = 3
    Sigmoid     = 4
    Precomputed = 5

# --- Utility 

def text_preparation(texts : np.ndarray) -> np.ndarray:
    """Prepare the given list of texts with stopwords and stemming

    Args:
        texts (np.ndarray): List of texts

    Returns:
        np.ndarray: Prepared list of texts
    """
    
    ps : PorterStemmer = PorterStemmer() # ? Take the root of a word (e.g. loved => love)

    sw : list = stopwords.words('english')

    sw.remove('not') # ? Keep "not" stop word since useful in the analysis

    corpus : list = list()

    for row in texts:
        
        text = re.sub('[^a-zA-Z]', ' ', row) # ? Remove all punctuations (not letters)
        text = text.lower()
        text = text.split()
        text = [ps.stem(word) for word in text if not word in set(sw)]
        text = ' '.join(text)
        
        corpus.append(text)
    
    return corpus

def prepare_dataset() -> None:
    """Connect to MongoDB database "LearningAI" and extract the documents from the collection "sentiment_analysis"
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

    sentiment_analysis_collection : pymongo.collection.Collection = database.get_collection('sentiment_analysis')

    cursor = sentiment_analysis_collection.find()
    
    original_data : list = list(cursor)
    
    df : pd.DataFrame = pd.DataFrame(original_data)
    
    df = df.drop(columns=['_id', 'Year', 'Month', 'Day', 'Time of Tweet', 'Platform'], axis=1)
    
    # * Prepare dataset
    
    # >>> Preprocessing 

    le = LabelEncoder()

    df['sentiment'] = le.fit_transform(df['sentiment'])
    
    # >>> Train/Test 

    X = df.iloc[:, :-1].values
    y = df.iloc[:, -1].values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    X_train = text_preparation(X_train[:, 0]) 
    X_test  = text_preparation(X_test[:, 0])
    
    # >>> Bag Of Words 
    
    global cv
    
    cv = CountVectorizer(max_features=900) # ? Take only the most frequent words as sparse matrix
    
    X_train = cv.fit_transform(X_train).toarray()
    X_test  = cv.transform(X_test).toarray()
    
    # * Close
    
    cursor.close()
    
    mongo_client.close()

def train_and_json(model, grid_search_cv_params : list, grid_search_cv_skip : bool = False) -> dict:
    """Train with the given model and prepare the JSON response

    Args:
        model (any): Classification model
        grid_search_cv_params (list): List of ditionaries for model parameters
        grid_search_cv_skip (bool, optional): Skip Grid Search Cross Validation. Defaults to False.

    Returns:
        dict: JSON response
    """
    
    # * Training

    model.fit(X_train, y_train)
    
    prediction = model.predict(X_test)
    
    # * Params

    cm_ = confusion_matrix(y_test, prediction)
    as_ = accuracy_score(y_test, prediction)
    ps_ = precision_score(y_test, prediction, average=None)
    rs_ = recall_score(y_test, prediction, average=None)
    f1_ = f1_score(y_test, prediction, average=None)
    
    # * Model selection (K-Fold Cross Validation - Grid Search Cross Validation)
    
    cv_ = cross_val_score(estimator=model, X=X_train, y=y_train, cv=10) # ? Cross Validation
    
    kfcv_ = [ float(format(float(cv_.mean() * 100), '.2f')), float(format(float(cv_.std() * 100), '.2f')) ]
    
    if not grid_search_cv_skip:
    
        gscv_ = GridSearchCV(estimator=model, param_grid=grid_search_cv_params, scoring='accuracy', n_jobs=-1, cv=10)

        gscv_.fit(X_train, y_train)
    
    # * JSON
    
    # ? T = True, F = False, P = Positive [2], N = Negative [0], n = Neutral [1]
    
    return\
    {
        "TNN": int(cm_[0][0]),
        "FNn": int(cm_[1][0]),
        "FNP": int(cm_[2][0]),
        "FnN": int(cm_[0][1]),
        "Tnn": int(cm_[1][1]),
        "FnP": int(cm_[2][1]),
        "FPN": int(cm_[0][2]),
        "FPn": int(cm_[1][2]),
        "TPP": int(cm_[2][2]),
        "Accuracy": as_ * 100.0,
        "Precision": (ps_ * 100.0).tolist(),
        "Recall": (rs_ * 100.0).tolist(),
        "F1": (f1_ * 100.0).tolist(),
        "KFoldCV": kfcv_,
        "GridSearchCV":
        {
            "Score": float(gscv_.best_score_ * 100.0) if not grid_search_cv_skip else 0.0,
            "BestParams": gscv_.best_params_ if not grid_search_cv_skip else {}
        }
    }

# --- Router 

@router.get(path="/dataset")
def dataset():
    
    # * Retrieve data from MongoDB dataset
    
    prepare_dataset()
    
    # * JSON
    
    return {}

@router.get(path="/logistic-regression", response_model=QualityParams)
def logistic_regression():
    
    global model_lr
    
    model_lr = LogisticRegression(random_state=42)
    
    return train_and_json(model=model_lr, grid_search_cv_params=[{ 'C': [0.25, 0.50, 0.75, 1.00 ], 'penalty' : [ 'l2' ] }])

@router.get(path="/k-nearest-neighbors", response_model=QualityParams)
def k_nearest_neighbors(neighbors : Annotated[int | None, Query(alias='neighbors', title='# Neighbours >= 1')] = 5):
    
    global model_knn
    
    model_knn = KNeighborsClassifier(n_neighbors=neighbors, metric='minkowski', p=2) # ! p = 2 => Euclidean

    return train_and_json(model=model_knn, grid_search_cv_params=[{ 'n_neighbors': [ 5, 10, 15, 20 ], 'leaf_size': [ 30, 40, 50 ], 'p': [ 1, 2, 3 ] }])

@router.get(path="/support-vector-classification", response_model=QualityParams)
def support_vector_classification(kernel : Annotated[int | None, Query(alias='kernel', title='SVM Kernel [1, 2, 3, 4, 5]')] = 1):
    
    kernel_name = "linear"
    
    match kernel:
        
        case KernelType.Linear:         kernel_name = "linear"
        case KernelType.Poly:           kernel_name = "poly"
        case KernelType.Rbf:            kernel_name = "rbf"
        case KernelType.Sigmoid:        kernel_name = "sigmoid"
        case KernelType.Precomputed:    kernel_name = "precomputed"
    
    global model_svc
    
    model_svc = SVC(kernel=kernel_name, random_state=42)

    return train_and_json(model=model_svc, grid_search_cv_params=[{ 'C': [0.25, 0.50, 0.75, 1.00 ], 'kernel': [ 'linear' ] },
                                                              { 'C': [0.25, 0.50, 0.75, 1.00 ], 'kernel' : [ 'rbf' ], 'gamma' : np.arange(0.1, 1.0, 0.1) }])

@router.get(path="/naive-bayes", response_model=QualityParams)
def naive_bayes():
    
    global model_nb
    
    model_nb = GaussianNB()
    
    return train_and_json(model=model_nb, grid_search_cv_params=[], grid_search_cv_skip=True)

@router.get(path="/decision-tree-classification", response_model=QualityParams)
def decision_tree_classifier():
    
    global model_dt
    
    model_dt = DecisionTreeClassifier(criterion='entropy', random_state=42)
    
    return train_and_json(model=model_dt, grid_search_cv_params=[{ 'criterion': [ 'gini', 'entropy', 'log_loss' ] }])

@router.get(path="/random-forest-classification", response_model=QualityParams)
def random_forest_classification(estimators : Annotated[int | None, Query(alias='estimators', title='Number of trees >= 1')] = 100):
    
    global model_rf
    
    model_rf = RandomForestClassifier(n_estimators=estimators, criterion='entropy', random_state=42)
    
    return train_and_json(model=model_rf, grid_search_cv_params=[{ 'n_estimators': [ 100, 150, 200 ], 'criterion': [ 'gini' ] },
                                                              { 'n_estimators': [ 100, 150, 200 ], 'criterion': [ 'entropy' ] },
                                                              { 'n_estimators': [ 100, 150, 200 ], 'criterion': [ 'log_loss' ] }])

@router.get(path="/x-g-boost-classification", response_model=QualityParams)
def x_g_boost_classification():
    
    global model_xgb
    
    model_xgb = XGBClassifier()
    
    return train_and_json(model=model_xgb, grid_search_cv_params=[], grid_search_cv_skip=True)

@router.put(path="/check-sentence/{sentence}", response_model=PredictionResults)
def check_sentence(sentence : str):
    
    return\
    {
        'LinearRegression'              : model_lr.predict(cv.transform(text_preparation(np.array([sentence]))).toarray()).tolist()[0],
        'KNearestNeighbors'             : model_knn.predict(cv.transform(text_preparation(np.array([sentence]))).toarray()).tolist()[0],
        'SupportVectorClassification'   : model_svc.predict(cv.transform(text_preparation(np.array([sentence]))).toarray()).tolist()[0],
        'NaiveBayes'                    : model_nb.predict(cv.transform(text_preparation(np.array([sentence]))).toarray()).tolist()[0],
        'DecisionTreeClassification'    : model_dt.predict(cv.transform(text_preparation(np.array([sentence]))).toarray()).tolist()[0],
        'RandomForestClassification'    : model_rf.predict(cv.transform(text_preparation(np.array([sentence]))).toarray()).tolist()[0],
        'XGBoostClassification'         : model_xgb.predict(cv.transform(text_preparation(np.array([sentence]))).toarray()).tolist()[0]
    }