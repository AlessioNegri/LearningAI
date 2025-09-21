"use client"

import axios, { AxiosRequestConfig } from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, ChartData, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Point, Plugin } from "chart.js";
import "chartjs-adapter-date-fns";
import { chart_js_options } from "@/app/deep-learning/recurrent-neural-network/script"
import { getRandomColor } from '@/lib/utils';

Chart.register(TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

var timer : NodeJS.Timeout;

export default function  PageRecurrentNeuralNetwork() : any
{
    const [data, setData] = useState<ChartData<"line">>({ labels: [''], datasets: [] });

    const [batchSize, setBatchSize] = useState<number>(32);
    
    const [epochs, setEpochs] = useState<number>(100);

    const [progress, setProgress] = useState<number>(0);

    const [sync, setSync] = useState<boolean>(false);

    const chartRef = useRef<Chart<'line', number[], string>>(null);

    // --- HTTP 

    // >>> HTTP GET to retrieve data
    async function get_data()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        var datasets = [];

        // * Dataset

        let response : any = await axios.get('http://localhost:8000/deep-learning/recurrent-neural-network/dataset', config).catch( (error : any) => { return; });

        if (response == undefined) return;
        
        var points : Point[] = [];

        for (var item of response.data) points.push({ x: item['x'], y: item['y'] });

        datasets.push({
                    label: "Data points",
                    data: points,
                    borderColor: 'rgb(255, 255, 255)',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                });

        // * Predictions

        response = await axios.get('http://localhost:8000/deep-learning/recurrent-neural-network/predictions', config).catch( (error : any) => { return; });

        if (response == undefined) return;

        for (var item of response.data)
        {
            var predicted_points : Point[] = [];

            for (var sub_item of item['points'])

                predicted_points.push({ x: sub_item['x'], y: sub_item['y'] });
            
            let color = getRandomColor();

            datasets.push({
                label: item['name'],
                data: predicted_points,
                borderColor: color,
                backgroundColor: color + "80",
                borderWidth: 2,
                pointRadius: 0,
                showLine: true,
                fill: false
            });
        }

        // * ChartJS datasets

        setData(
        {
            labels: ["Data"],
            datasets: datasets
        });
    }

    // >>> HTTP GET to train the RNN
    async function get_train()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get(`http://localhost:8000/deep-learning/recurrent-neural-network/train?batch_size=${batchSize}&epochs=${epochs}`, config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setSync(true);
    }

    // >>> HTTP GET to retrieve the RNN progress status
    async function get_status()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get(`http://localhost:8000/deep-learning/recurrent-neural-network/status`, config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setProgress(response.data['epoch_count'] / response.data['epochs'] * 100);

        if (response.data['trained'] || response.data['stop'])
        {
            setSync(false);
        }
    }

    // >>> HTTP PUT to stop RNN training
    async function put_stop_training()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.put('http://localhost:8000/deep-learning/recurrent-neural-network/stop-training', config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setSync(false);
    }

    // --- Use Effect 

    useEffect(() => { if (typeof window !== "undefined") { import("chartjs-plugin-zoom").then((plugin) => { Chart.register(plugin.default); }); } }, []);

    useEffect(() => { get_data(); get_status() }, []);

    useEffect(() => { if (sync) { timer = setInterval( () => { get_status() }, 1000); } else { clearInterval(timer) } }, [sync])

    // --- Rendering 

    return (
        <div>

            <div className="chart-params">
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

            <div className="chart-container h-[700px]">
                <Line ref={chartRef} redraw={false} data={data} options={chart_js_options("NFLX Stock", "Open Value")} onDoubleClick={() => chartRef.current!.resetZoom()} />
            </div>

            <div className="description">
                <h1 className="description-title">Recurrent Neural Network</h1>
                <p>
                    A <strong>Recurrent Neural Network</strong> (RNN) is a type of deep learning model designed to process sequential data,
                    such as time series, text, or speech, by using internal memory to retain information from previous inputs to influence current and future outputs.
                    This "memory" is achieved through feedback loops that allow information to persist, enabling RNNs to understand context and
                    dependencies in sequences, making them effective for tasks like language translation, speech recognition, and natural language processing.
                </p>
            </div>

        </div>
    );
}