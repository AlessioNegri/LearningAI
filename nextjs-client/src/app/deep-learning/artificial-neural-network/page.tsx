'use client';

import axios, { AxiosRequestConfig } from 'axios';
import React, { useEffect, useState } from 'react';

var timer : NodeJS.Timeout;

interface MetricsData
{
    id          : number
    name        : string
    accuracy    : number
    f1          : number[]
    precision   : number[]
    recall      : number[]
}

export default function PageArtificialNeuralNetwork() : any
{
    const [batchSize, setBatchSize] = useState<number>(16);

    const [epochs, setEpochs] = useState<number>(100);

    const [progress, setProgress] = useState<number>(50);

    const [sync, setSync] = useState<boolean>(false);

    const [metrics, setMetrics] = useState<MetricsData[]>();

    // --- HTTP 

    // >>> HTTP GET to retrieve data
    async function get_data()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get('http://localhost:8000/deep-learning/artificial-neural-network/dataset', config).catch( (error : any) => { return; });

        if (response == undefined) return;

        get_metrics();
    }

    // >>> HTTP GET to retrieve metrics values
    async function get_metrics()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Metrics

        let response : any = await axios.get('http://localhost:8000/deep-learning/artificial-neural-network/metrics', config).catch( (error : any) => { return; });

        if (response == undefined) return;

        var metrics_list : MetricsData[] = [];

        for (let model of response.data)
        {
            metrics_list.push({
                id          : model['id'],
                name        : model['name'],
                accuracy    : model['accuracy'],
                f1          : model['f1'],
                precision   : model['precision'],
                recall      : model['recall']
            });
        }

        setMetrics(metrics_list);
    }

    // >>> HTTP GET to train the ANN
    async function get_train()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get(`http://localhost:8000/deep-learning/artificial-neural-network/train?batch_size=${batchSize}&epochs=${epochs}`, config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setSync(true);
    }

    // >>> HTTP GET to retrieve the ANN progress status
    async function get_status()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get(`http://localhost:8000/deep-learning/artificial-neural-network/status`, config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setProgress(response.data['epoch_count'] / response.data['epochs'] * 100);

        if (response.data['trained'] || response.data['stop'])
        {
            setSync(false);

            get_metrics();
        }
    }

    // >>> HTTP PUT to stop ANN training
    async function put_stop_training()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.put('http://localhost:8000/deep-learning/artificial-neural-network/stop-training', config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setSync(false);
    }

    // --- UseEffect 

    useEffect(() => { get_data(); get_status() }, []);

    useEffect(() => { if (sync) { timer = setInterval( () => { get_status() }, 1000); } else { clearInterval(timer) } }, [sync])

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

            </div>

            <div className="flex flex-col w-full h-full overflow-auto text-green-300 shadow-md shadow-green-300 rounded-4xl bg-clip-border border-4 border-green-300">
                        
                <table className="w-full table-auto font-mono">

                    <thead className="bg-sky-800 text-2xl">
                        <tr className="border-b-2 border-green-300">
                            <th className="border-r-2 border-green-300">Model</th>
                            <th>Accuracy</th>
                            <th>Precision</th>
                            <th>Recall</th>
                            <th>F1</th>
                        </tr>
                    </thead>

                    <tbody className="bg-sky-900 text-2xl text-center">
                        {
                            metrics?.map( (value: MetricsData, index: number) =>
                            {
                                return (
                                    <tr key={index}>
                                        <td className="text-left border-r-2 border-green-300">{value['name']}</td>
                                        <td>{Number(value['accuracy']).toFixed(2) + ' %'}</td>
                                        <td>{value['precision'].map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                                        <td>{value['recall'].map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                                        <td>{value['f1'].map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>

                    <caption className="bg-sky-900 caption-bottom h-10 pt-2">
                        For Precision, Recall, and F1 are listed the values for Low, Medium, and High song popularity.
                    </caption>

                </table>

            </div>

            <div className="description">
                <h1 className="description-title">Artificial Neural Network</h1>
                <p>
                    A deep learning <strong>Artificial Neural Network</strong> (ANN) is a computational model, inspired by the human brain,
                    that consists of interconnected "neurons" or nodes organized into layers, including an input layer, one or more hidden layers,
                    and an output layer. These layers process information by passing signals through weighted connections and activation functions,
                    and the network learns from data through a process called training, typically using backpropagation to adjust the weights and
                    improve its ability to recognize patterns, make predictions, and solve complex problems in areas like image recognition and natural language processing. 
                </p>
            </div>

        </div>
    );
}