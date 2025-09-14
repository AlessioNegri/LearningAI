from dotenv import load_dotenv

load_dotenv()

import os

os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import aiofiles
import keras
import numpy as np
import pandas as pd
import tensorflow as tf

from common import utility

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query, status, UploadFile
from keras.preprocessing.image import img_to_array, load_img
from keras.src.legacy.preprocessing.image import ImageDataGenerator
from pydantic import BaseModel
from typing import Annotated, List

# --- Params 

DATASET_DIR : str = './deep-learning-dataset/cnn'

MODELS_DIR : str = './fastapi-server/models'

training_set    = None
test_set        = None

cnn : keras.models.Sequential = None

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

class PredictModel(BaseModel):
    
    id      : int
    name    : str
    result  : int

info_data : InfoData = InfoData()

router : APIRouter = APIRouter(prefix='/deep-learning/convolutional-neural-network', tags=['Deep Learning - Convolutional Neural Network'])

class FitCallback(keras.callbacks.Callback):
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

def prepare_dataset(batch_size : int = 32) -> None:
    """Retrieve the images from a local folder
    
    Args:
        batch_size (int, optional): Size of the batch. Defaults to 32.
    """
    
    global training_set
    global test_set
    
    # * Data-Augmentation only on training data
    
    training_datagen    = ImageDataGenerator(rescale=1.0/255, shear_range=0.2, zoom_range=0.2, horizontal_flip=True)
    test_datagen        = ImageDataGenerator(rescale=1.0/255)
    
    training_set    = training_datagen.flow_from_directory(directory=f'{DATASET_DIR}/training_set', target_size=(64,64), batch_size=batch_size, class_mode='binary')
    test_set        = test_datagen.flow_from_directory(directory=f'{DATASET_DIR}/test_set', target_size=(64,64), batch_size=batch_size, class_mode='binary')

def train_model(epochs : int = 25):
    """Train the Convolutional Neural Network (CNN)
    
    Args:
        epochs (int, optional): Training epochs. Defaults to 25.
    """
    
    global cnn
    global info_data
    
    info_data.trained   = False
    info_data.epochs    = epochs
    
    # * Create the Convolutional Neural Network
    
    cnn = keras.models.Sequential()
    
    cnn.add(keras.layers.Input(shape=[64, 64, 3])) # ? 64 px X 64 px X RGB

    cnn.add(keras.layers.Conv2D(filters=32, kernel_size=3, activation='relu'))
    cnn.add(keras.layers.MaxPool2D(pool_size=2, strides=2))
    
    cnn.add(keras.layers.Conv2D(filters=32, kernel_size=3, activation='relu'))
    cnn.add(keras.layers.MaxPool2D(pool_size=2, strides=2))
    
    cnn.add(keras.layers.Flatten())
    
    cnn.add(keras.layers.Dense(units=128, activation='relu'))
    cnn.add(keras.layers.Dense(units=1, activation='sigmoid'))
    
    # * Train

    cnn.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    
    try:

        cnn.fit(x=training_set, validation_data=test_set, epochs=epochs, callbacks=[FitCallback()])
        
        info_data.trained       = True
        info_data.epoch_count   = 1
        
        # * Save the model
        
        model_path : str = f'{MODELS_DIR}/animals-epochs_{epochs}.keras'
        
        if os.path.exists(model_path): os.remove(model_path)
            
        cnn.save(model_path)
    
    except:
        
        info_data.trained = False

# --- Router 

# >>> GET

@router.get(path='/dataset')
def dataset(batch_size : Annotated[int | None, Query(alias='batch_size', title='Batch Size >= 8')] = 32):
    
    # * Retrieve data local dataset
    
    prepare_dataset(batch_size=batch_size)
    
    # * JSON
    
    return {}

@router.get(path='/train')
def train(background_tasks : BackgroundTasks,
          epochs : Annotated[int | None, Query(alias='epochs', title='Epochs >= 1')] = 25):
    
    # * Train CNN
    
    background_tasks.add_task(train_model, epochs)
    
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

# >>> POST

@router.post(path='/predict', response_model=List[PredictModel], status_code=status.HTTP_202_ACCEPTED)
async def predict(file : UploadFile):
    
    # * Save file in server
    
    file_path : str = f'{DATASET_DIR}/predict.' + file.filename.split('.')[-1]
    
    async with aiofiles.open(file_path, 'wb') as file_out:
        
        content = await file.read()
        
        await file_out.write(content)
    
    # * Process file
    
    predict_list : list = []
    
    for id, filename in enumerate(sorted(os.listdir(MODELS_DIR))):
        
        if not filename.startswith('animals'): continue
    
        cnn_model : keras.Model = keras.saving.load_model(MODELS_DIR + '/' + filename)
        
        test_image = load_img(path=file_path, target_size=(64, 64))
        test_image = img_to_array(img=test_image)
        test_image = np.expand_dims(test_image, axis=0)
        
        prediction : np.ndarray = cnn_model.predict(test_image)
        
        predict_list.append(dict(id=id, name=filename, result=int(prediction[0][0])))
    
    return predict_list