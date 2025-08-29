"use client"

import axios, { AxiosRequestConfig } from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, ChartData, ArcElement, Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { chart_js_options } from "@/app/machine-learning/reinforcement-learning/script"

Chart.register(ArcElement, Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface Retailers
{
    Retailer1: number
    Retailer2: number
    Retailer3: number
    Retailer4: number
    Retailer5: number
    Retailer6: number
    Retailer7: number
    Retailer8: number
}

export default function PageClassification() : any
{
    const [data, setData] = useState<ChartData<'bar'>>({ labels: [''], datasets: [] });

    const chartRef = useRef<Chart<'bar', number[], string>>(null);

    // --- HTTP 

    // >>> HTTP GET to retrieve dataset data
    async function dataset()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get('http://localhost:8000/machine-learning/reinforcement-learning/dataset', config).catch( (error : any) => { return; });

        if (response == undefined) return;
    }

    // >>> HTTP GET to retrieve models data
    async function models()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Upper Confidence Bound

        let response : any = await axios.get('http://localhost:8000/machine-learning/reinforcement-learning/upper-confidence-bound', config).catch( (error : any) => { return; });

        if (response == undefined) return;
        
        var ucb: Retailers =
        {
            Retailer1: Number(Number(Number(response.data["Retailer01"]) / Number(response.data["TotalReward"]) * 100.0).toFixed(2)),
            Retailer2: Number(Number(Number(response.data["Retailer02"]) / Number(response.data["TotalReward"]) * 100.0).toFixed(2)),
            Retailer3: Number(Number(Number(response.data["Retailer03"]) / Number(response.data["TotalReward"]) * 100.0).toFixed(2)),
            Retailer4: Number(Number(Number(response.data["Retailer04"]) / Number(response.data["TotalReward"]) * 100.0).toFixed(2)),
            Retailer5: Number(Number(Number(response.data["Retailer05"]) / Number(response.data["TotalReward"]) * 100.0).toFixed(2)),
            Retailer6: Number(Number(Number(response.data["Retailer06"]) / Number(response.data["TotalReward"]) * 100.0).toFixed(2)),
            Retailer7: Number(Number(Number(response.data["Retailer07"]) / Number(response.data["TotalReward"]) * 100.0).toFixed(2)),
            Retailer8: Number(Number(Number(response.data["Retailer08"]) / Number(response.data["TotalReward"]) * 100.0).toFixed(2))
        } as Retailers;

        // * Thompson Sampling

        response = await axios.get('http://localhost:8000/machine-learning/reinforcement-learning/thompson-sampling', config).catch( (error : any) => { return; });

        if (response == undefined) return;
        
        var ts: Retailers =
        {
            Retailer1: Number(Number(Number(response.data["Retailer01"]) / Number(response.data["TotalReward"]) * 100.0).toFixed(2)),
            Retailer2: Number(Number(Number(response.data["Retailer02"]) / Number(response.data["TotalReward"]) * 100.0).toFixed(2)),
            Retailer3: Number(Number(Number(response.data["Retailer03"]) / Number(response.data["TotalReward"]) * 100.0).toFixed(2)),
            Retailer4: Number(Number(Number(response.data["Retailer04"]) / Number(response.data["TotalReward"]) * 100.0).toFixed(2)),
            Retailer5: Number(Number(Number(response.data["Retailer05"]) / Number(response.data["TotalReward"]) * 100.0).toFixed(2)),
            Retailer6: Number(Number(Number(response.data["Retailer06"]) / Number(response.data["TotalReward"]) * 100.0).toFixed(2)),
            Retailer7: Number(Number(Number(response.data["Retailer07"]) / Number(response.data["TotalReward"]) * 100.0).toFixed(2)),
            Retailer8: Number(Number(Number(response.data["Retailer08"]) / Number(response.data["TotalReward"]) * 100.0).toFixed(2))
        } as Retailers;

        // * ChartJS datasets

        setData(
        {
            labels: ["Upper Confidence Bound", "Thompson Sampling"],
            datasets: [
            {
                label: 'Retailer 1',
                data: [ucb.Retailer1, ts.Retailer1],
                backgroundColor: ["rgba(0,255,255,0.5)", "rgba(0,255,255,0.5)"],
                borderColor: ["rgb(0,255,255)", "rgb(0,255,255)"],
                borderWidth: 3,
                borderRadius: 10
            },
            {
                label: 'Retailer 2',
                data: [ucb.Retailer2, ts.Retailer2],
                backgroundColor: ["rgba(255,0,255,0.5)", "rgba(255,0,255,0.5)"],
                borderColor: ["rgb(255,0,255)", "rgb(255,0,255)"],
                borderWidth: 3,
                borderRadius: 10
            },
            {
                label: 'Retailer 3',
                data: [ucb.Retailer3, ts.Retailer3],
                backgroundColor: ["rgba(0,255,0,0.5)", "rgba(0,255,0,0.5)"],
                borderColor: ["rgb(0,255,0)", "rgb(0,255,0)"],
                borderWidth: 3,
                borderRadius: 10
            },
            {
                label: 'Retailer 4',
                data: [ucb.Retailer4, ts.Retailer4],
                backgroundColor: ["rgba(255,255,0,0.5)", "rgba(255,255,0,0.5)"],
                borderColor: ["rgb(255,255,0)", "rgb(255,255,0)"],
                borderWidth: 3,
                borderRadius: 10
            },
            {
                label: 'Retailer 5',
                data: [ucb.Retailer5, ts.Retailer5],
                backgroundColor: ["rgba(255,0,0,0.5)", "rgba(255,0,0,0.5)"],
                borderColor: ["rgb(255,0,0)", "rgb(255,0,0)"],
                borderWidth: 3,
                borderRadius: 10
            },
            {
                label: 'Retailer 6',
                data: [ucb.Retailer6, ts.Retailer6],
                backgroundColor: ["rgba(255,255,255,0.5)", "rgba(255,255,255,0.5)"],
                borderColor: ["rgb(255,255,255)", "rgb(255,255,255)"],
                borderWidth: 3,
                borderRadius: 10
            },
            {
                label: 'Retailer 7',
                data: [ucb.Retailer7, ts.Retailer7],
                backgroundColor: ["rgba(125,125,125,0.5)", "rgba(125,125,125,0.5)"],
                borderColor: ["rgb(125,125,125)", "rgb(125,125,125)"],
                borderWidth: 3,
                borderRadius: 10
            },
            {
                label: 'Retailer 8',
                data: [ucb.Retailer8, ts.Retailer8],
                backgroundColor: ["rgba(0,0,0,0.5)", "rgba(0,0,0,0.5)"],
                borderColor: ["rgb(0,0,0)", "rgb(0,0,0)"],
                borderWidth: 3,
                borderRadius: 10
            }
            ]
        });
    }

    // >>> HTTP GET to retrieve data
    async function get_data()
    {
        await dataset();

        await models();
    }

    // --- Use Effect 

    useEffect(() => { get_data() }, []);
    
    // --- Rendering 

    return (
        <div>

            <div className="chart-container h-[500px]">
                <Bar ref={chartRef} redraw={false} data={data} options={chart_js_options("Retailers", "Reward %")} />
            </div>

            <div className="description">
                <h1 className="description-title">Reinforcement Learning</h1>
                <p>
                    In <strong>Machine Learning</strong>, reinforcement learning is a machine learning technique where an "agent" learns to make decisions through
                    trial and error by interacting with an "environment" to achieve a specific goal. The agent receives rewards for good actions and penalties for bad ones,
                    and it learns to optimize its strategy (policy) to maximize cumulative rewards over time.
                    This learning process is autonomous and does not require explicitly programmed instructions or labeled datasets, making it ideal for tasks in complex
                    environments like robotics, autonomous driving, and gaming. 
                    There are different algorithms:
                </p>
                <ul className="list-disc pl-8 space-y-4 mt-4">
                    <li><strong>Upper Confidence Bound</strong></li>
                    <li><strong>Thompson Sampling</strong></li>
                </ul>
            </div>

        </div>
    );
}