"use client"

import axios, { AxiosRequestConfig } from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, ChartData, ArcElement, Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { chart_js_options } from "@/app/machine-learning/classification/script"

Chart.register(ArcElement, Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface FullDataDict
{
    Age     : number
    Fare    : number
    Sex     : number    // ? 0 = Male, 1 = Female
    Sibsp   : number
    Parch   : number
    Pclass  : number    // ? 1 = 1st, 2 = 2nd, 3 = 3rd
    Embarked: number    // ? 0-C = Cherbourg, 1-Q = Queenstown, 2-S = Southampton
    Survived: boolean
}

interface BaseDict
{
    y: number   // ? Survived
    n: number   // ? Died
}

interface SexDict
{
    Male: BaseDict
    Female: BaseDict
}

interface ClassDict
{
    First: BaseDict
    Second: BaseDict
    Third: BaseDict
}

interface EmbarkedDict
{
    Cherbourg: BaseDict
    Queenstown: BaseDict
    Southampton: BaseDict
}

interface ConfusionMatrixDict
{
    TN: number  // ? True-Negative
    FN: number  // ? False-Negative
    FP: number  // ? False-Positive
    TP: number  // ? True-Positive
    AC: number  // ? Accuracy
}

type DictInfo = { id: number, value: string };

export default function PageClassification() : any
{
    const [datasetData, setDatasetData] = useState<ChartData<"bar">>({ labels: [''], datasets: [] });

    const [confusionMatrixData, setConfusionMatrixData] = useState<ChartData<"bar">>({ labels: [''], datasets: [] });

    const [methods, setMethods] = useState<DictInfo[]>(
        [
            { id: 1, value: "PrincipalComponentAnalysis"},
            { id: 2, value: "LinearDiscriminantAnalysis"},
            { id: 3, value: "KernelPrincipalComponentAnalysis"}
        ]);

    const [kernels, setKernels] = useState<DictInfo[]>(
        [
            { id: 1, value: "Linear"},
            { id: 2, value: "Poly"},
            { id: 3, value: "Rbf"},
            { id: 4, value: "Sigmoid"},
            { id: 5, value: "Precomputed"}
        ]);

    const [method, setMethod] = useState<number>(2);

    const [neighbors, setNeighbors] = useState<number>(5);

    const [kernel, setKernel] = useState<number>(1);

    const [estimators, setEstimators] = useState<number>(10);

    const datasetRef = useRef<Chart<"bar", number[], string>>(null);

    const confusionMatrixRef = useRef<Chart<"bar", number[], string>>(null);

    // --- HTTP 

    // >>> HTTP GET to retrieve dataset data
    async function dataset()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get('http://localhost:8000/machine-learning/classification/dataset?method=' + String(method), config).catch( (error : any) => { return; });

        if (response == undefined) return;

        // * Sex
        
        var sex: SexDict = { Male: { y: 0, n: 0 }, Female: { y: 0, n: 0 } } as SexDict;

        for (var item of response.data)
        {
            if (Boolean(item["Survived"]))
            {
                if (Number(item["Sex"]) === 0) sex.Male.y += 1;
                if (Number(item["Sex"]) === 1) sex.Female.y += 1;
            }
            else
            {
                if (Number(item["Sex"]) === 0) sex.Male.n += 1;
                if (Number(item["Sex"]) === 1) sex.Female.n += 1;
            }
        }

        // * Class
        
        var pclass: ClassDict = { First: { y: 0, n: 0 }, Second: { y: 0, n: 0 }, Third: { y: 0, n: 0 } } as ClassDict;

        for (var item of response.data)
        {
            if (Boolean(item["Survived"]))
            {
                if (Number(item["Pclass"]) === 1) pclass.First.y += 1;
                if (Number(item["Pclass"]) === 2) pclass.Second.y += 1;
                if (Number(item["Pclass"]) === 3) pclass.Third.y += 1;
            }
            else
            {
                if (Number(item["Pclass"]) === 1) pclass.First.n += 1;
                if (Number(item["Pclass"]) === 2) pclass.Second.n += 1;
                if (Number(item["Pclass"]) === 3) pclass.Third.n += 1;
            }
        }

        // * Embarked
        
        var embarked: EmbarkedDict = { Cherbourg: { y: 0, n: 0 }, Queenstown: { y: 0, n: 0 }, Southampton: { y: 0, n: 0 } } as EmbarkedDict;

        for (var item of response.data)
        {
            if (Boolean(item["Survived"]))
            {
                if (Number(item["Embarked"]) === 0) embarked.Cherbourg.y += 1;
                if (Number(item["Embarked"]) === 1) embarked.Queenstown.y += 1;
                if (Number(item["Embarked"]) === 2) embarked.Southampton.y += 1;
            }
            else
            {
                if (Number(item["Embarked"]) === 0) embarked.Cherbourg.n += 1;
                if (Number(item["Embarked"]) === 1) embarked.Queenstown.n += 1;
                if (Number(item["Embarked"]) === 2) embarked.Southampton.n += 1;
            }
        }

        // * ChartJS datasets

        setDatasetData(
        {
            labels: ["Survived", "Died"],
            datasets: [
            {
                label: "Male",
                data: [sex.Male.y, sex.Male.n],
                backgroundColor: ["rgba(0,255,255,0.5)", "rgba(0,255,255,0.5)"],
                borderColor: ["rgb(0,255,255)", "rgb(0,255,255)"],
                borderWidth: 3,
                borderRadius: 10
            },
            {
                label: "Female",
                data: [sex.Female.y, sex.Female.n],
                backgroundColor: ["rgba(255,0,255,0.5)", "rgba(255,0,255,0.5)"],
                borderColor: ["rgb(255,0,255)", "rgb(255,0,255)"],
                borderWidth: 3,
                borderRadius: 10
            },
            {
                label: "First Class",
                data: [pclass.First.y, pclass.First.n],
                backgroundColor: ["rgba(0,255,0,0.5)", "rgba(0,255,0,0.5)"],
                borderColor: ["rgb(0,255,0)", "rgb(0,255,0)"],
                borderWidth: 3,
                borderRadius: 10
            },
            {
                label: "Second Class",
                data: [pclass.Second.y, pclass.Second.n],
                backgroundColor: ["rgba(255,255,0,0.5)", "rgba(255,255,0,0.5)"],
                borderColor: ["rgb(255,255,0)", "rgb(255,255,0)"],
                borderWidth: 3,
                borderRadius: 10
            },
            {
                label: "Third Class",
                data: [pclass.Third.y, pclass.Third.n],
                backgroundColor: ["rgba(255,0,0,0.5)", "rgba(255,0,0,0.5)"],
                borderColor: ["rgb(255,0,0)", "rgb(255,0,0)"],
                borderWidth: 3,
                borderRadius: 10
            },
            {
                label: "Cherbourg",
                data: [embarked.Cherbourg.y, embarked.Cherbourg.n],
                backgroundColor: ["rgba(255,255,255,0.5)", "rgba(255,255,255,0.5)"],
                borderColor: ["rgb(255,255,255)", "rgb(255,255,255)"],
                borderWidth: 3,
                borderRadius: 10
            },
            {
                label: "Queenstown",
                data: [embarked.Queenstown.y, embarked.Queenstown.n],
                backgroundColor: ["rgba(125,125,125,0.5)", "rgba(125,125,125,0.5)"],
                borderColor: ["rgb(125,125,125)", "rgb(125,125,125)"],
                borderWidth: 3,
                borderRadius: 10
            },
            {
                label: "Southampton",
                data: [embarked.Southampton.y, embarked.Southampton.n],
                backgroundColor: ["rgba(0,0,0,0.5)", "rgba(0,0,0,0.5)"],
                borderColor: ["rgb(0,0,0)", "rgb(0,0,0)"],
                borderWidth: 3,
                borderRadius: 10
            }
            ]
        });
    }

    // >>> HTTP GET to retrieve confusion matrix data
    async function confusionMatrix()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Logistic Regression

        let response : any = await axios.get('http://localhost:8000/machine-learning/classification/logistic-regression', config).catch( (error : any) => { return; });

        if (response == undefined) return;
        
        var lr: ConfusionMatrixDict =
        {
            TN: Number(response.data["TN"]),
            FN: Number(response.data["FN"]),
            FP: Number(response.data["FP"]),
            TP: Number(response.data["TP"]),
            AC: Number(response.data["AC"]) * 100.0
        } as ConfusionMatrixDict;

        // * K-Nearest Neighbors

        response = await axios.get('http://localhost:8000/machine-learning/classification/k-nearest-neighbors?neighbors=' + String(neighbors), config).catch( (error : any) => { return; });

        if (response == undefined) return;
        
        var knn: ConfusionMatrixDict =
        {
            TN: Number(response.data["TN"]),
            FN: Number(response.data["FN"]),
            FP: Number(response.data["FP"]),
            TP: Number(response.data["TP"]),
            AC: Number(response.data["AC"]) * 100.0
        } as ConfusionMatrixDict;

        // * Support Vector Classification

        response = await axios.get('http://localhost:8000/machine-learning/classification/support-vector-classification?kernel=' + String(kernel), config).catch( (error : any) => { return; });

        if (response == undefined) return;
        
        var svc: ConfusionMatrixDict =
        {
            TN: Number(response.data["TN"]),
            FN: Number(response.data["FN"]),
            FP: Number(response.data["FP"]),
            TP: Number(response.data["TP"]),
            AC: Number(response.data["AC"]) * 100.0
        } as ConfusionMatrixDict;

        // * Naive Bayes

        response = await axios.get('http://localhost:8000/machine-learning/classification/naive-bayes', config).catch( (error : any) => { return; });

        if (response == undefined) return;
        
        var nb: ConfusionMatrixDict =
        {
            TN: Number(response.data["TN"]),
            FN: Number(response.data["FN"]),
            FP: Number(response.data["FP"]),
            TP: Number(response.data["TP"]),
            AC: Number(response.data["AC"]) * 100.0
        } as ConfusionMatrixDict;

        // * Decision Tree for Classification

        response = await axios.get('http://localhost:8000/machine-learning/classification/decision-tree-classification', config).catch( (error : any) => { return; });

        if (response == undefined) return;
        
        var dt: ConfusionMatrixDict =
        {
            TN: Number(response.data["TN"]),
            FN: Number(response.data["FN"]),
            FP: Number(response.data["FP"]),
            TP: Number(response.data["TP"]),
            AC: Number(response.data["AC"]) * 100.0
        } as ConfusionMatrixDict;

        // * Random Forest for Classification

        response = await axios.get('http://localhost:8000/machine-learning/classification/random-forest-classification?estimators=' + String(estimators), config).catch( (error : any) => { return; });

        if (response == undefined) return;
        
        var rf: ConfusionMatrixDict =
        {
            TN: Number(response.data["TN"]),
            FN: Number(response.data["FN"]),
            FP: Number(response.data["FP"]),
            TP: Number(response.data["TP"]),
            AC: Number(response.data["AC"]) * 100.0
        } as ConfusionMatrixDict;

        // * ChartJS datasets

        setConfusionMatrixData(
        {
            labels: ["True Negative", "False Negative", "False Positive", "True Positive"],
            datasets: [
            {
                label: `Logistic Regression - ${Number(lr.AC).toFixed(2)}%`,
                data: [lr.TN, lr.FN, lr.FP, lr.TP],
                backgroundColor: ["rgba(0,255,255,0.5)", "rgba(0,255,255,0.5)"],
                borderColor: ["rgb(0,255,255)", "rgb(0,255,255)"],
                borderWidth: 3,
                borderRadius: 10
            },
            {
                label: `K-Nearest Neighbors - ${Number(knn.AC).toFixed(2)}%`,
                data: [knn.TN, knn.FN, knn.FP, knn.TP],
                backgroundColor: ["rgba(255,0,255,0.5)", "rgba(255,0,255,0.5)"],
                borderColor: ["rgb(255,0,255)", "rgb(255,0,255)"],
                borderWidth: 3,
                borderRadius: 10
            },
            {
                label: `Support Vector Machine (SVC) - ${Number(svc.AC).toFixed(2)}%`,
                data: [svc.TN, svc.FN, svc.FP, svc.TP],
                backgroundColor: ["rgba(0,255,0,0.5)", "rgba(0,255,0,0.5)"],
                borderColor: ["rgb(0,255,0)", "rgb(0,255,0)"],
                borderWidth: 3,
                borderRadius: 10
            },
            {
                label: `Naive Bayes - ${Number(nb.AC).toFixed(2)}%`,
                data: [nb.TN, nb.FN, nb.FP, nb.TP],
                backgroundColor: ["rgba(255,255,0,0.5)", "rgba(255,255,0,0.5)"],
                borderColor: ["rgb(255,255,0)", "rgb(255,255,0)"],
                borderWidth: 3,
                borderRadius: 10
            },
            {
                label: `Decision Tree - ${Number(dt.AC).toFixed(2)}%`,
                data: [dt.TN, dt.FN, dt.FP, dt.TP],
                backgroundColor: ["rgba(255,0,0,0.5)", "rgba(255,0,0,0.5)"],
                borderColor: ["rgb(255,0,0)", "rgb(255,0,0)"],
                borderWidth: 3,
                borderRadius: 10
            },
            {
                label: `Random Forest - ${Number(rf.AC).toFixed(2)}%`,
                data: [rf.TN, rf.FN, rf.FP, rf.TP],
                backgroundColor: ["rgba(255,255,255,0.5)", "rgba(255,255,255,0.5)"],
                borderColor: ["rgb(255,255,255)", "rgb(255,255,255)"],
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

        await confusionMatrix();
    }

    // --- Use Effect 

    useEffect(() => { get_data() }, []);

    useEffect(() => { get_data(); }, [method, neighbors, kernel, estimators]);
    
    // --- Rendering 

    return (
        <div>

            <div className="chart-container h-[500px]">
                <Bar ref={datasetRef} redraw={false} data={datasetData} options={chart_js_options("Titanic", "Count")} />
            </div>

            <div className="chart-params">
                <label>Dimensionality Reduction method</label>
                <select name="method" id="method" className="w-[300px]"
                        value={method}
                        onChange={ (e) => setMethod(Number(e.target.value)) }>
                    {
                        methods.map( (item: DictInfo, index: number) => { return <option key={item.id} value={item.id}>{item.value}</option> })
                    }
                </select>

                <label>KNN Neighbours</label>
                <input type="number" value={neighbors} min={1} max={100} onChange={ (e) => { setNeighbors(Number(e.target.value)) } } placeholder="Insert the number of neighbors" required />

                <label>SVC Kernel</label>
                <select name="method" id="method" className="w-[200px]"
                        value={kernel}
                        onChange={ (e) => setKernel(Number(e.target.value)) }>
                    {
                        kernels.map( (item: DictInfo, index: number) => { return <option key={item.id} value={item.id}>{item.value}</option> })
                    }
                </select>

                <label>Random Forest Estimators</label>
                <input type="number" value={estimators} min={1} max={100} onChange={ (e) => { setEstimators(Number(e.target.value)) } } placeholder="Insert the number of neighbors" required />
            </div>

            <div className="w-full h-[500px] border-2 border-white rounded-4xl p-10 my-8">
                <Bar ref={confusionMatrixRef} redraw={false} data={confusionMatrixData} options={chart_js_options("Confusion Matrix - Accuracy %", "Count")} />
            </div>

            <div className="description">
                <h1 className="description-title">Classification</h1>
                <p>
                    In <strong>Machine Learning</strong>, classification is a supervised learning technique used to categorize data into predefined classes or categories.
                    It involves training a model on labeled data (where the correct category is known) to learn patterns and then using that model to predict the class of new, unseen data.
                    There are different algorithms:
                </p>
                <ul className="list-disc pl-8 space-y-4 mt-4">
                    <li><strong>Logistic Regression</strong></li>
                    <li><strong>K-Nearest Neighbors</strong></li>
                    <li><strong>Support Vector for Classification</strong> (SVC) from the Support Vector Machine (with different kernels)</li>
                    <li><strong>Naive Bayes</strong></li>
                    <li><strong>Decision Tree for Classification</strong></li>
                    <li><strong>Random Forest for Classification</strong></li>
                </ul>
            </div>

        </div>
    );
}