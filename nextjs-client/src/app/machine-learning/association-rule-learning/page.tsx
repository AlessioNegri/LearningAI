'use client';

import axios, { AxiosRequestConfig } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { PolarArea } from 'react-chartjs-2';
import { Chart, ChartData, RadialLinearScale, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { chart_js_options, getRandomColor } from "./script";

Chart.register(RadialLinearScale, ArcElement, Title, Tooltip);

export default function PageAssociationRuleLearning() : any
{
    const [aprioriData, setAprioriData] = useState<ChartData<'polarArea'>>({ labels: [''], datasets: [] });
    
    const [eclatlData, setEclatData] = useState<ChartData<'polarArea'>>({ labels: [''], datasets: [] });

    const [transaction, setTransaction] = useState<string>('');

    const [largest, setLargest] = useState<number>(5);

    const aprioriRef = useRef<Chart<'polarArea', number[], string>>(null);
    
    const eclatRef = useRef<Chart<'polarArea', number[], string>>(null);

    // --- HTTP 

    // >>> HTTP GET to retrieve dataset data
    async function dataset()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get('http://localhost:8000/machine-learning/association-rule-learning/dataset', config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setTransaction(String(response.data['Items']).replaceAll(',', ' => '));
    }

    // >>> HTTP GET to retrieve confusion matrix data
    async function models()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Apriori Rules

        let response : any = await axios.get('http://localhost:8000/machine-learning/association-rule-learning/apriori-rules?largest=' + String(largest), config).catch( (error : any) => { return; });

        if (response == undefined) return;

        var apriori_labels : string[] = [];
        var apriori_data : number[] = [];
        var apriori_color : string[] = [];

        for (var result of response.data)
        {
            apriori_labels.push(result['Left'] + ' => ' + result['Right']);
            
            apriori_data.push(result['Lift']);

            apriori_color.push(getRandomColor() + "A0");
        }

        // * Eclat Rules

        response = await axios.get('http://localhost:8000/machine-learning/association-rule-learning/eclat-rules?largest=' + String(largest), config).catch( (error : any) => { return; });

        if (response == undefined) return;

        var eclat_labels : string[] = [];
        var eclat_data : number[] = [];

        for (var result of response.data)
        {
            eclat_labels.push(result['Left'] + ' => ' + result['Right']);
            
            eclat_data.push(result['Support']);
        }

        // * ChartJS datasets

        setAprioriData(
        {
            labels: apriori_labels,
            datasets: [
            {
                data: apriori_data,
                backgroundColor: apriori_color,
                borderColor: "rgba(255,255,255,0)",
                borderWidth: 3,
                borderRadius: 10
            }
            ]
        });
        
        setEclatData(
        {
            labels: eclat_labels,
            datasets: [
            {
                data: eclat_data,
                backgroundColor: apriori_color,
                borderColor: "rgba(255,255,255,0)",
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

    useEffect(() => { get_data() }, [largest]);

    // --- Rendering 

    return (
        <div>

            <div className="chart-params">
                <label>Transaction</label>
                <input value={transaction} readOnly className='flex-1'/>
                <button className='action-button' onClick={ (e : any) => { dataset() } }>Get Random</button>
                <label className='ml-4'>Largest Results</label>
                <input type='number' min={1} max={10} value={largest} onChange={ (e) => setLargest(Number(e.target.value)) }/>
            </div>

            <div className='w-full flex space-x-4 justify-between'>
            <div className='chart-container flex-1 h-[700px] my-8'>
                <PolarArea ref={aprioriRef} redraw={false} data={aprioriData} options={chart_js_options('Apriori Rules - Lift')} />
            </div>

            <div className='chart-container flex-1 h-[700px] my-8'>
                <PolarArea ref={eclatRef} redraw={false} data={eclatlData} options={chart_js_options('Eclat Rules - Support')} />
            </div>
        </div>

            <div className="description">
                <h1 className="description-title">Association Rule Learning</h1>
                <p>
                    In <strong>Machine Learning</strong>, association rule learning is a machine learning method for finding "if-then" relationships, also called association rules, in large datasets,
                    often used in market basket analysis to discover products frequently bought together.
                    This unsupervised technique uses algorithms like Apriori or FP-Growth to identify patterns based on metrics like support (frequency of items appearing together) and confidence
                    (how often a rule is true). The resulting rules, such as "if a customer buys bread, they are likely to also buy butter," can be used for targeted marketing, product placement,
                    and other data-driven decisions.
                    There are different algorithms:
                </p>
                <ul className="list-disc pl-8 space-y-4 mt-4">
                    <li><strong>Apriori Rules</strong></li>
                    <li><strong>Eclat Rules</strong></li>
                </ul>
            </div>

        </div>
    );
}