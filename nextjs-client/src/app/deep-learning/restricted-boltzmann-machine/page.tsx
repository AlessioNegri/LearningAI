'use client';

import axios, { AxiosRequestConfig } from 'axios';
import React, { useEffect, useState } from 'react';

var timer : NodeJS.Timeout;

interface MetricsData
{
    id      : number
    name    : string
    loss    : number
}

export default function PageRestrictedBoltzmannMachine() : any
{
    const [batchSize, setBatchSize] = useState<number>(100);

    const [epochs, setEpochs] = useState<number>(10);

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

        let response : any = await axios.get('http://localhost:8000/deep-learning/restricted-boltzmann-machine/dataset', config).catch( (error : any) => { return; });

        if (response == undefined) return;

        get_metrics();
    }

    // >>> HTTP GET to retrieve metrics values
    async function get_metrics()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Metrics

        let response : any = await axios.get('http://localhost:8000/deep-learning/restricted-boltzmann-machine/metrics', config).catch( (error : any) => { return; });

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

    // >>> HTTP GET to train the RBM
    async function get_train()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get(`http://localhost:8000/deep-learning/restricted-boltzmann-machine/train?batch_size=${batchSize}&epochs=${epochs}`, config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setSync(true);
    }

    // >>> HTTP GET to retrieve the RBM progress status
    async function get_status()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get(`http://localhost:8000/deep-learning/restricted-boltzmann-machine/status`, config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setProgress(response.data['epoch_count'] / response.data['epochs'] * 100);

        if (response.data['trained'] || response.data['stopped'])
        {
            setSync(false);

            if (response.data['trained']) get_metrics();
        }
    }

    // >>> HTTP PUT to stop RBM training
    async function put_stop_training()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.put('http://localhost:8000/deep-learning/restricted-boltzmann-machine/stop-training', config).catch( (error : any) => { return; });

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
                                        <td>{Number(value.loss).toFixed(2) + ' %'}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>

                </table>

            </div>

            <div className="description">
                <h1 className="description-title">Restricted Boltzmann Machine</h1>
                <p>
                    A deep learning <strong>Restricted Boltzmann Machine</strong> (RBM) is a type of stochastic artificial neural network with two
                    layers (a visible layer for input data and a hidden layer for learned features) that are connected only to each other, with no
                    connections within the same layer. RBMs are unsupervised generative models that learn a probability distribution over the input
                    data and are trained using contrastive divergence to perform tasks such as dimensionality reduction, feature learning, and
                    pre-training deep networks.
                </p>
            </div>

        </div>
    );
}