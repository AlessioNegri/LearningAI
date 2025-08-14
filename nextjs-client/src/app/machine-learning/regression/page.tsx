"use client"

import axios, { AxiosRequestConfig } from "axios";
import React, { MouseEvent, MouseEventHandler, useEffect, useRef, useState } from "react";
import { Scatter } from "react-chartjs-2";
import { Chart, ChartData, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Point, TimeUnit, PluginChartOptions, TitleOptions, ScaleChartOptions, LegendOptions, ChartEvent, LegendElement, LegendItem, Plugin } from "chart.js";
import "chartjs-adapter-date-fns";
import { chart_js_options } from "@/app/machine-learning/regression/script"

Chart.register(TimeScale, LinearScale, TimeScale, PointElement, LineElement, Title, Tooltip, Legend);

type DictInfo = { id: number, value: string };

interface PageRegressionProps
{
    points? : ChartData<"scatter">
}

export default function  PageRegression({ points } :  PageRegressionProps) : any
{
    const [data, setData] = useState<ChartData<"scatter">>({ labels: [''], datasets: [] });

    const [title, setTitle] = useState<string>("");

    const [columns, setColumns] = useState<DictInfo[]>([]);

    const [column, setColumn] = useState<number>(1);

    const [degree, setDegree] = useState<number>(3);

    const [estimators, setEstimators] = useState<number>(50);

    const [options, setOptions] = useState<any>(chart_js_options());

    const chartRef = useRef<Chart<'scatter', number[], string>>(null);

    // --- HTTP 

    // >>> HTTP GET to retrieve info
    async function get_info()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Info

        let response : any = await axios.get('http://localhost:8000/machine-learning/regression/info', config).catch( (error : any) => { return; });

        if (response == undefined) return;

        // * Prepare
        
        setTitle(response.data["name"]);

        let values : DictInfo[] = [];

        for (let i : number = 0; i < response.data["columns"].length; ++i) values.push({ id: Number(response.data["columns"][i]), value: String(response.data["descriptions"][i]) });

        setColumns(values);

        setOptions(chart_js_options(response.data["name"], values.find( (e: DictInfo) => e.id === column )?.value));
    }

    // >>> HTTP GET to retrieve data
    async function get_data()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get('http://localhost:8000/machine-learning/regression/dataset?column=' + String(column), config).catch( (error : any) => { return; });

        if (response == undefined) return;
        
        var points : Point[] = [];

        for (var item of response.data) points.push({ x: item['x'], y: item['y'] });

        // * Linear Regression

        response = await axios.get('http://localhost:8000/machine-learning/regression/linear-regression', config).catch( (error : any) => { return; });

        if (response == undefined) return;

        var linear_regression_points : Point[] = [];

        for (var item of response.data) linear_regression_points.push({ x: item['x'], y: item['y'] });
        
        // * Polynomial Regression

        response = await axios.get('http://localhost:8000/machine-learning/regression/polynomial-regression?degree=' + String(degree), config).catch( (error : any) => { return false; }).finally( () => { return true; } );

        if (response == undefined) return;

        var polynomial_regression_points : Point[] = [];

        for (var item of response.data) polynomial_regression_points.push({ x: item['x'], y: item['y'] });

        // * Support Vector for Regression

        response = await axios.get('http://localhost:8000/machine-learning/regression/support-vector-regression', config).catch( (error : any) => { return false; }).finally( () => { return true; } );

        if (response == undefined) return;

        var support_vector_regression_points : Point[] = [];

        for (var item of response.data) support_vector_regression_points.push({ x: item['x'], y: item['y'] });

        // * Decision Tree for Regression

        response = await axios.get('http://localhost:8000/machine-learning/regression/decision-tree-regression', config).catch( (error : any) => { return false; }).finally( () => { return true; } );

        if (response == undefined) return;

        var decision_tree_regression_points : Point[] = [];

        for (var item of response.data) decision_tree_regression_points.push({ x: item['x'], y: item['y'] });

        // * Random Forest for Regression

        response = await axios.get('http://localhost:8000/machine-learning/regression/random-forest-regression?estimators=' + String(estimators), config).catch( (error : any) => { return false; }).finally( () => { return true; } );

        if (response == undefined) return;

        var random_forest_regression_points : Point[] = [];

        for (var item of response.data) random_forest_regression_points.push({ x: item['x'], y: item['y'] });

        // * ChartJS datasets

        setData(
        {
            labels: ["Data"],
            datasets: [
                {
                    label: "Data points",
                    data: points,
                    borderColor: 'rgb(255, 255, 255)',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    tension: 0.4,
                    borderWidth: 2,
                    fill: false,
                    hoverBorderColor: 'rgb(125, 125, 125)',
                    hoverBackgroundColor: 'rgba(125, 125, 125, 0.5)',
                    pointStyle: 'rectRot',
                    pointRadius: 10,
                    pointHoverRadius: 15
                },
                {
                    label: "Linear",
                    data: linear_regression_points,
                    borderColor: 'rgb(255, 0, 255)',
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false,
                    borderDash: [10, 5]
                },
                {
                    label: "Polynomial",
                    data: polynomial_regression_points,
                    borderColor: 'rgb(255, 255, 0)',
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: "Support Vector Machine (SVR)",
                    data: support_vector_regression_points,
                    borderColor: 'rgb(255, 0, 0)',
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: "Decision Tree",
                    data: decision_tree_regression_points,
                    borderColor: 'rgb(0, 255, 0)',
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: "Random Forest",
                    data: random_forest_regression_points,
                    borderColor: 'rgb(0, 255, 255)',
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                }
            ]
        });
    }

    // --- Use Effect 

    useEffect(() => { if (typeof window !== "undefined") { import("chartjs-plugin-zoom").then((plugin) => { Chart.register(plugin.default); }); } }, []);

    useEffect(() => { get_info(); get_data() }, []);

    useEffect(() => { get_data(); setOptions(chart_js_options(title, columns.find( (e: DictInfo) => e.id === column )?.value)); }, [column, degree, estimators]);

    // --- ChartJS plugins 
    var resetButtonCoordinates = { top: 0, bottom: 0, left: 0, right: 0 };

    const resetButton : Plugin<"scatter"> =
    {
        id: "resetButton",

        beforeDraw(chart: Chart<"scatter", Point[], unknown>, args, options)
        {
            const { ctx, chartArea: { top, bottom, left, right, width, height } } = chart;

            ctx.save();

            ctx.font = "24px Arial";

            const textWidth = ctx.measureText("Reset").width;

            ctx.fillStyle = "oklch(87% 0.065 274.039 / 50%)";
            ctx.fillRect(right - textWidth - 30, 0, textWidth + 20, 25);

            ctx.strokeStyle = "#FFFFFF";
            ctx.strokeRect(right - textWidth - 30, 0, textWidth + 20, 25);

            ctx.fillStyle = "#FFFFFF";
            ctx.textAlign = "left";
            ctx.fillText("Reset", right - textWidth - 20, 20);

            ctx.restore();

            resetButtonCoordinates.left     = right - textWidth - 30;
            resetButtonCoordinates.right    = right;
            resetButtonCoordinates.top      = 0;
            resetButtonCoordinates.bottom   = 25;
        }
    };

    function resetButtonClicked(e: any)
    {
        //chartRef.current!.resetZoom();
    };

    // --- Rendering
    return (
        <div>

            <div className="w-full h-[700px] border-2 border-white rounded-4xl p-10 mb-8">
                <Scatter ref={chartRef} redraw={false} data={data} options={options} /*plugins={[resetButton]} onClick={resetButtonClicked}*/ onDoubleClick={() => chartRef.current!.resetZoom()} />
                {/*<button className="rounded-full border border-white text-white transition-colors hover:bg-indigo-200 hover:border-transparent hover:text-indigo-900 font-bold sm:h-12 md:w-[158px] z-30"
                        onClick={() => chartRef.current!.resetZoom()}>Reset</button>
                */}
            </div>

            <div className="flex space-x-4 content-center text-white">
                <p className="align-middle leading-10">Dataset column</p>
                <select name="column" id="column" className="w-[700px] border-2 border-white rounded-xl bg-indigo-400 text-white p-2"
                        onChange={ (e) => setColumn(Number(e.target.value)) }>
                    {
                        columns.map( (item: DictInfo, index: number) => { return <option key={item.id} value={item.id}>{item.value}</option> })
                    }
                </select>
                <label className="align-middle leading-10">Polynomial Degree</label>
                <input type="number" value={degree} min={1} max={10} onChange={ (e) => { setDegree(Number(e.target.value)) } } className="border-2 border-white rounded-xl bg-indigo-400 text-white p-2 focus:border-indigo-900 block" placeholder="Insert the polynomial degree" required />
                <label className="align-middle leading-10">Random Forest Estimators</label>
                <input type="number" value={estimators} min={10} max={100} onChange={ (e) => { setEstimators(Number(e.target.value)) } } className="border-2 border-white rounded-xl bg-indigo-400 text-white p-2 focus:border-indigo-900 block" placeholder="Insert the number of estimators" required />
            </div>

            <div className="mt-10 p-4 pt-4 border-t-2 border-orange-300 text-white text-xl">
                <h1 className="text-orange-200 font-bold text-4xl text-center mb-4">Regression</h1>
                <p>
                    In <strong>Machine Learning</strong>, regression is a supervised learning technique used to predict a continuous outcome variable based on one or more input features.
                    It aims to find the relationship between variables to make predictions about future events or to estimate unknown values. There are different algorithms:
                </p>
                <ul className="list-disc pl-8 space-y-4 mt-4">
                    <li><strong>Linear Regression</strong></li>
                    <li><strong>Polynomial Regression</strong></li>
                    <li><strong>Support Vector for Regression</strong> (SVR) from the Support Vector Machine</li>
                    <li><strong>Decision Tree for Regression</strong></li>
                    <li><strong>Random Forest for Regression</strong></li>
                </ul>
            </div>

        </div>
    );
}