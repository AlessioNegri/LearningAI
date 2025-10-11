'use client';

import axios, { AxiosRequestConfig } from 'axios';
import React, { useEffect, useState } from 'react';

import { Icon } from '@iconify/react';

var timer : NodeJS.Timeout;

interface MetricsData
{
    id      : number
    name    : string
    loss    : number
}

export default function PageStackedAutoencoder() : any
{
    const [epochs, setEpochs] = useState<number>(200);

    const [progress, setProgress] = useState<number>(0);

    const [sync, setSync] = useState<boolean>(false);

    const [metrics, setMetrics] = useState<MetricsData[]>();

    // --- HTTP 

    // >>> HTTP GET to retrieve data
    async function get_data()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get('http://localhost:8000/deep-learning/stacked-autoencoder/dataset', config).catch( (error : any) => { return; });

        if (response == undefined) return;

        get_metrics();
    }

    // >>> HTTP GET to retrieve metrics values
    async function get_metrics()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Metrics

        let response : any = await axios.get('http://localhost:8000/deep-learning/stacked-autoencoder/metrics', config).catch( (error : any) => { return; });

        if (response == undefined) return;

        var metrics_list : MetricsData[] = [];

        for (let model of response.data)
        {
            metrics_list.push({
                id      : model['id'],
                name    : model['name'],
                loss    : model['loss']
            });
        }

        setMetrics(metrics_list);
    }

    // >>> HTTP GET to train the SAE
    async function get_train()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get(`http://localhost:8000/deep-learning/stacked-autoencoder/train?epochs=${epochs}`, config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setSync(true);
    }

    // >>> HTTP GET to retrieve the SAE progress status
    async function get_status()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get(`http://localhost:8000/deep-learning/stacked-autoencoder/status`, config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setProgress(response.data['epoch_count'] / response.data['epochs'] * 100);

        if (response.data['trained'] || response.data['stopped'])
        {
            setSync(false);

            if (response.data['trained']) get_metrics();
        }
    }

    // >>> HTTP PUT to stop SAE training
    async function put_stop_training()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.put('http://localhost:8000/deep-learning/stacked-autoencoder/stop-training', config).catch( (error : any) => { return; });

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
                            <th>Loss</th>
                        </tr>
                    </thead>

                    <tbody className="bg-sky-900 text-2xl text-center">
                        {
                            metrics?.map( (value: MetricsData, index: number) =>
                            {
                                return (
                                    <tr key={index}>
                                        <td className="text-left border-r-2 border-green-300">{value.name}</td>
                                        <td className='flex text-nowrap justify-center gap-x-4'>
                                            <p>{Number(value.loss).toFixed(2) + ' / 5'}</p>
                                            <Icon icon={'solar:star-bold'} width={32} height={32} color='#7bf1a8' />
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>

                </table>

            </div>

            <div className="description">
                <h1 className="description-title">Stacked Autoencoder</h1>
                <p>
                    A <strong>Stacked Autoencoder</strong> (SAE) is a deep neural network that learns hierarchical feature representations of data by
                    stacking multiple autoencoders on top of each other. It is trained layer-by-layer in an unsupervised manner, and the output of each
                    encoder layer becomes the input for the next one. The network's primary goal is to learn an efficient and compressed representation
                    of the input data for tasks like dimensionality reduction, feature extraction, and pre-training for other tasks. 
                </p>
            </div>

        </div>
    );
}