'use client';

import axios, { AxiosRequestConfig } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { Bubble } from 'react-chartjs-2';
import { Chart, ChartData, LinearScale, PointElement, Title, Legend, BubbleDataPoint } from 'chart.js';
import { chart_js_options, getRandomColor } from './script';

Chart.register(LinearScale, PointElement, Title, Legend);

interface ClusteringDict
{
    cluster: number
    points: BubbleDataPoint[]
}

export default function PageClustering() : any
{
    const [datasetData, setDatasetData] = useState<ChartData<'bubble'>>({ labels: [''], datasets: [] });

    const [kMeansData, setKMeansData] = useState<ChartData<'bubble'>>({ labels: [''], datasets: [] });

    const [hierarchicalData, setHierarchicalData] = useState<ChartData<'bubble'>>({ labels: [''], datasets: [] });

    const [radius, setRadius] = useState<string>('FlipperLength');

    const [kMeansClusters, setKMeansClusters] = useState<number>(2);

    const [hierarchicalClusters, setHierarchicalClusters] = useState<number>(2);

    const datasetRef = useRef<Chart<'bubble', BubbleDataPoint[], string>>(null);

    const kMeansRef = useRef<Chart<'bubble', BubbleDataPoint[], string>>(null);

    const hierarchicalRef = useRef<Chart<'bubble', BubbleDataPoint[], string>>(null);

    // --- HTTP 

    // >>> HTTP GET to retrieve dataset data
    async function dataset()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get('http://localhost:8000/machine-learning/clustering/dataset', config).catch( (error : any) => { return; });

        if (response == undefined) return;

        let minValue : number = 100000;

        for (var item of response.data) if (item[radius] < minValue) minValue = item[radius];

        var male : BubbleDataPoint[] = [];
        var female : BubbleDataPoint[] = [];

        for (var item of response.data)
        {
            if (item['Sex'] == "MALE") male.push({ x: item['CulmenLength'], y: item['CulmenDepth'], r: Number(Number(item[radius] / minValue * 5).toFixed(2)) });
            
            if (item['Sex'] == "FEMALE") female.push({ x: item['CulmenLength'], y: item['CulmenDepth'], r: Number(Number(item[radius] / minValue * 5).toFixed(2)) });
        }

        // * ChartJS datasets

        setDatasetData(
        {
            labels: ["Data"],
            datasets: [
                {
                    label: "Male",
                    data: male,
                    borderColor: 'rgb(0, 255, 255)',
                    backgroundColor: 'rgba(0, 255, 255, 0.5)',
                    borderWidth: 2,
                    hoverBorderColor: 'rgb(255, 255, 255)',
                    hoverBackgroundColor: 'rgba(255, 255, 255, 0.5)',
                    pointStyle: 'circle'
                },
                {
                    label: "Female",
                    data: female,
                    borderColor: 'rgb(255, 0, 255)',
                    backgroundColor: 'rgba(255, 0, 255, 0.5)',
                    borderWidth: 2,
                    hoverBorderColor: 'rgb(255, 255, 255)',
                    hoverBackgroundColor: 'rgba(255, 255, 255, 0.5)',
                    pointStyle: 'circle'
                }
            ]
        });
    }

    // >>> HTTP GET to retrieve models data
    async function models()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * K-Means Clustering

        let response : any = await axios.get('http://localhost:8000/machine-learning/clustering/k-means-clustering?clusters=' + String(kMeansClusters), config).catch( (error : any) => { return; });

        if (response == undefined) return;

        let minValue : number = 100000;

        let clusters : number[] = [];

        for (var item of response.data)
        {
            if (item[radius] < minValue) minValue = item[radius];

            if (clusters.find( (e : number) => { return e == item['Cluster']; }) === undefined) clusters.push(item['Cluster']);
        }

        clusters.sort( (a : number, b : number) => a - b );

        var k_means_clusters : ClusteringDict[] = [];

        for (var cluster of clusters) k_means_clusters.push({ cluster: cluster, points: [] });

        for (var item of response.data)
        {
            k_means_clusters[item['Cluster']].points.push({ x: item['CulmenLength'], y: item['CulmenDepth'], r: Number(Number(item[radius] / minValue * 5).toFixed(2)) });
        }

        var k_means_datasets : any[] = [];

        for (var k_means_cluster of k_means_clusters)
        {
            let color = getRandomColor();

            k_means_datasets.push(
                {
                    label: 'Cluster ' + k_means_cluster.cluster,
                    data: k_means_cluster.points,
                    borderColor: color,
                    backgroundColor: color + "80",
                    borderWidth: 2,
                    hoverBorderColor: 'rgb(255, 255, 255)',
                    hoverBackgroundColor: 'rgba(255, 255, 255, 0.5)',
                    pointStyle: 'circle'
                }
            );
        }

        // * Hierarchical Clustering

        response = await axios.get('http://localhost:8000/machine-learning/clustering/hierarchical-clustering?clusters=' + String(hierarchicalClusters), config).catch( (error : any) => { return; });

        if (response == undefined) return;

        minValue = 100000;

        clusters = [];

        for (var item of response.data)
        {
            if (item[radius] < minValue) minValue = item[radius];

            if (clusters.find( (e : number) => { return e == item['Cluster']; }) === undefined) clusters.push(item['Cluster']);
        }

        clusters.sort( (a : number, b : number) => a - b );

        var hierarchical_clusters : ClusteringDict[] = [];

        for (var cluster of clusters) hierarchical_clusters.push({ cluster: cluster, points: [] });

        for (var item of response.data)
        {
            hierarchical_clusters[item['Cluster']].points.push({ x: item['CulmenLength'], y: item['CulmenDepth'], r: Number(Number(item[radius] / minValue * 5).toFixed(2)) });
        }

        var hierarchical_datasets : any[] = [];

        for (var hierarchical_cluster of hierarchical_clusters)
        {
            let color = getRandomColor();

            hierarchical_datasets.push(
                {
                    label: 'Cluster ' + hierarchical_cluster.cluster,
                    data: hierarchical_cluster.points,
                    borderColor: color,
                    backgroundColor: color + "80",
                    borderWidth: 2,
                    hoverBorderColor: 'rgb(255, 255, 255)',
                    hoverBackgroundColor: 'rgba(255, 255, 255, 0.5)',
                    pointStyle: 'circle'
                }
            );
        }

        // * ChartJS datasets

        setKMeansData(
        {
            labels: ["Data"],
            datasets: k_means_datasets
        });

        setHierarchicalData(
        {
            labels: ["Data"],
            datasets: hierarchical_datasets
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
        
    useEffect(() => { get_data(); }, [radius, kMeansClusters, hierarchicalClusters]);

    // --- Rendering 

    return (
        <div className='w-full heropattern-jigsaw-red-100/50'>

            <div className='chart-container h-[700px]'>
                <Bubble ref={datasetRef} redraw={false} data={datasetData} options={chart_js_options()} />
            </div>

            <div className="chart-params">
                <label>Radius</label>
                <select name="column" id="column" className="w-[200px]" value={radius} onChange={ (e) => setRadius(e.target.value) }>
                    <option value={'FlipperLength'}>Flipper Length [mm]</option>
                    <option value={'BodyMass'}>Body Mass [g]</option>
                </select>

                <label>K-Means Clusters</label>
                <input type="number" value={kMeansClusters} min={1} max={100} onChange={ (e) => { setKMeansClusters(Number(e.target.value)) } } placeholder="Insert the number of clusters" required />

                <label>Hierarchical Clusters</label>
                <input type="number" value={hierarchicalClusters} min={1} max={100} onChange={ (e) => { setHierarchicalClusters(Number(e.target.value)) } } placeholder="Insert the number of clusters" required />
            </div>

            <div className='w-full flex space-x-4 justify-between'>
                <div className='chart-container flex-1 h-[700px] my-8'>
                    <Bubble ref={kMeansRef} redraw={false} data={kMeansData} options={chart_js_options('K-Means Clustering')} />
                </div>

                <div className='chart-container flex-1 h-[700px] my-8'>
                    <Bubble ref={hierarchicalRef} redraw={false} data={hierarchicalData} options={chart_js_options('Hierarchical Clustering')} />
                </div>
            </div>

            <div className="description">
                <h1 className="description-title">Clustering</h1>
                <p>
                    In <strong>Machine Learning</strong>, clustering  is an unsupervised learning technique that groups similar data points together into clusters based on inherent patterns and similarities within the data.
                    It's used to discover hidden structures and relationships in unlabeled datasets without predefined categories.
                    There are different algorithms:
                </p>
                <ul className="list-disc pl-8 space-y-4 mt-4">
                    <li><strong>K-Means Clustering</strong></li>
                    <li><strong>Hierarchical Clustering</strong></li>
                </ul>
            </div>

        </div>
    );
}