'use client';

import axios, { AxiosRequestConfig } from 'axios';
import React, { useEffect, useState } from 'react';

interface IPrediction
{
    text    : string,
    color   : string
}

export default function PageConvolutionalNeuralNetwork() : any
{
    const [level, setLevel] = useState<number>(95);

    const [src, setSrc] = useState<string | Blob | undefined>();

    const [frauds, setFrauds] = useState<number[]>();

    const [networkPredictions, setNetworkPredictions] = useState<IPrediction[]>();

    // --- HTTP 

    // >>> HTTP GET to retrieve data
    async function get_data()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get('http://localhost:8000/deep-learning/self-organizing-map/dataset', config).catch( (error : any) => { return; });

        if (response == undefined) return;

        get_som()
    }

    // >>> HTTP GET to retrieve SOM
    async function get_som()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get('http://localhost:8000/deep-learning/self-organizing-map/model', config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setSrc('http://localhost:8000/deep-learning/self-organizing-map/image')

        get_frauds()
    }

    // >>> HTTP GET to retrieve frauds
    async function get_frauds()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Frauds

        let response : any = await axios.get(`http://localhost:8000/deep-learning/self-organizing-map/frauds?level=${level}`, config).catch( (error : any) => { return; });

        if (response == undefined) return;

        var found_frauds : number[] = response.data;

        setFrauds(response.data)

        // * Artificial Neural Network

        response = await axios.get(`http://localhost:8000/deep-learning/self-organizing-map/neural-network`, config).catch( (error : any) => { return; });

        if (response == undefined) return;

        var predictions : IPrediction[] = [];

        for (let value of response.data)
        {
            predictions.push({ text: value, color: found_frauds?.find( (e : number) => e === Number(String(value).split(' - ')[0]) ) !== undefined ? 'text-red-300' : 'text-green-300' })
        }

        setNetworkPredictions(predictions);
    }

    // --- UseEffect 

    //useEffect(() => { get_data(); get_som(); get_frauds() }, []);

    useEffect(() => { get_data() }, [level]);

    // --- Rendering 

    return (
        <div>

            <h1 className='text-green-300 font-bold text-4xl text-center mb-4'>Fraudulent Customer IDs</h1>
            
            <div className='chart-params'>

                <label>Level [%] (white = 100%, black = 0%)</label>
                <input type='number' value={level} min={0} max={99} onChange={ (e) => { setLevel(Number(e.target.value)) } } placeholder='Choose a level' required />

            </div>

            <div className='flex justify-center mt-10'>

                <div className='flex-1'>

                    <p className='text-green-300 font-bold text-3xl text-center mb-4 border-b-2'>Self Organizing Map</p>

                    <div className='grid grid-cols-5 gap-x-8 gap-y-4'>
                    {
                        frauds?.map( ( fraud : number, index : number) => { return <p key={index} className='text-green-300 font-bold text-2xl'>{fraud}</p> } )
                    }
                    </div>

                </div>

                <img src={src} width={800} height={800} />

                <div className='flex-1'>

                    <p className='text-green-300 font-bold text-3xl text-center mb-4 border-b-2'>Artificial Neural Network</p>

                    <div className='grid grid-cols-5 gap-x-8 gap-y-4'>
                        {
                            networkPredictions?.map( ( pred : IPrediction, index : number) => { return <p key={index} className={`${pred.color} font-bold text-2xl`}>{pred.text}</p> } )
                        }
                    </div>
                
                </div>
            
            </div>

            <div className="description">
                <h1 className="description-title">Self Organizing Map</h1>
                <p>
                    A deep learning <strong>Self Organizing Map</strong> (SOM) is an unsupervised neural network that uses a competitive learning approach
                    to reduce the dimensionality of high-dimensional data into a low-dimensional, typically two-dimensional, "map".
                    It is used for clustering and visualizing complex, unlabeled datasets by preserving the spatial and topological relationships between data points,
                    allowing similar data to be represented by nearby neurons on the map. 
                </p>
            </div>

        </div>
    );
}