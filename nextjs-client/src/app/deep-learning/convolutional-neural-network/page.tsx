'use client';

import axios, { AxiosRequestConfig } from 'axios';
import React, { useEffect, useState } from 'react';

import { Icon } from '@iconify/react';

var timer : NodeJS.Timeout;

interface PredictData
{
    id      : number
    name    : string
    result  : number
}

export default function PageConvolutionalNeuralNetwork() : any
{
    const [batchSize, setBatchSize] = useState<number>(32);

    const [epochs, setEpochs] = useState<number>(25);

    const [progress, setProgress] = useState<number>(0);

    const [sync, setSync] = useState<boolean>(false);

    const [predict, setPredict] = useState<PredictData[]>();

    const [image, setImage] = useState<File | null | undefined>();

    const [src, setSrc] = useState<string | Blob | undefined>();

    // --- HTTP 

    // >>> HTTP GET to retrieve data
    async function get_data()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get(`http://localhost:8000/deep-learning/convolutional-neural-network/dataset?batch_size=${batchSize}`, config).catch( (error : any) => { return; });

        if (response == undefined) return;
    }

    // >>> HTTP POST to retrieve predict values
    async function post_predict()
    {
        if (image === null || image === undefined) return;

        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' } };

        // * Metrics

        let data : FormData = new FormData();

        data.append('file', image!, image!.name);

        let response : any = await axios.post('http://localhost:8000/deep-learning/convolutional-neural-network/predict', data, config).catch( (error : any) => { return; });

        if (response == undefined) return;

        var predict_list : PredictData[] = [];

        for (let model of response.data)
        {
            predict_list.push({
                id      : model['id'],
                name    : model['name'],
                result  : model['result']
            });
        }

        setPredict(predict_list);
    }

    // >>> HTTP GET to train the CNN
    async function get_train()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get(`http://localhost:8000/deep-learning/convolutional-neural-network/train?epochs=${epochs}`, config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setSync(true);
    }

    // >>> HTTP GET to retrieve the CNN progress status
    async function get_status()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get(`http://localhost:8000/deep-learning/convolutional-neural-network/status`, config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setProgress(response.data['epoch_count'] / response.data['epochs'] * 100);

        if (response.data['trained'] || response.data['stop'])
        {
            setSync(false);
        }
    }

    // >>> HTTP PUT to stop CNN training
    async function put_stop_training()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.put('http://localhost:8000/deep-learning/convolutional-neural-network/stop-training', config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setSync(false);
    }

    // --- UseEffect 

    useEffect(() => { get_data(); get_status() }, []);

    useEffect(() => { if (sync) { timer = setInterval( () => { get_status() }, 1000); } else { clearInterval(timer) } }, [sync]);

    useEffect(() => { if (image !== undefined) { setSrc(URL.createObjectURL(image!)); } post_predict(); }, [image]);

    // --- Rendering 

    return (
        <div>
            
            <div className='chart-params'>

                <label>Batch Size</label>
                <input type='number' value={batchSize} min={8} max={64} onChange={ (e) => { setBatchSize(Number(e.target.value)) } } placeholder='Choose a batch size' required />

                <label># Epochs</label>
                <input type='number' value={epochs} min={1} max={500} onChange={ (e) => { setEpochs(Number(e.target.value)) } } placeholder='Choose a number of epochs' required />

                <button type='button' className='action-button' disabled={sync} onClick={ (e) => { get_train() } }>Train</button>
                <button type='button' className='action-button bg-red-800 border-yellow-300 hover:bg-orange-400' disabled={!sync} onClick={ (e) => { put_stop_training() } }>Abort</button>

                <div className='h-[40px] w-full bg-sky-800 rounded-full m-auto'>
                    <div className='h-full bg-green-600 text-2xl font-medium text-sky-100 text-center p-2 leading-none rounded-full' style={{width: `${progress}%`}}></div>
                </div>

                <label className='ml-4'>{Number(progress).toFixed(2)} %</label>

                <input placeholder={'Load File...'} type='file' name='image' disabled={sync} accept='.jpg,.png,.jpeg' value={''} onChange={ (e) => { setImage(e.target.files?.item(0)) } } />

            </div>

            <div className="flex flex-col w-full h-full overflow-auto text-green-300 shadow-md shadow-green-300 rounded-4xl bg-clip-border border-4 border-green-300">
                        
                <table className="w-full table-auto font-mono">

                    <thead className="bg-sky-800 text-2xl">
                        <tr className="border-b-2 border-green-300">
                            <th className="border-r-2 border-green-300">Model</th>
                            <th>Image</th>
                            <th>Prediction</th>
                        </tr>
                    </thead>

                    <tbody className="bg-sky-900 text-2xl text-center">
                        {
                            predict?.map( (value: PredictData, index: number) =>
                            {
                                return (
                                    <tr key={index}>
                                        <td className="text-left border-r-2 border-green-300">{value.name}</td>
                                        <td className='flex justify-center'><img src={src} /></td>
                                        <td>
                                            <div className='flex'>
                                                <Icon icon='solar:cat-bold' width={100} height={100} color={`${value.result == 0 ? '#00FF00' : '#FF0000'}`} className='mt-auto w-full' />
                                                <Icon icon='mdi:dog' width={100} height={100} color={`${value.result == 1 ? '#00FF00' : '#FF0000'}`} className='mt-auto w-full' />
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>

                </table>

            </div>

            <div className="description">
                <h1 className="description-title">Convolutional Neural Network</h1>
                <p>
                    A deep learning <strong>Convolutional Neural Network</strong> (CNN) is a type of artificial neural network,
                    specialized for processing data with a grid-like topology, such as images. CNNs use convolutional layers with
                    filters to automatically detect hierarchical features—from simple edges and textures to complex objects—in an image,
                    mimicking the human visual system. Key components include convolutional layers, pooling layers for dimensionality reduction,
                    and fully connected layers for classification, enabling them to achieve state-of-the-art results in tasks like image
                    classification, object detection, and medical image analysis. 
                </p>
            </div>

        </div>
    );
}