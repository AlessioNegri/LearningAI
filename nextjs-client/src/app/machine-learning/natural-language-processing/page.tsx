'use client';

import { Icon } from "@iconify/react";
import axios, { AxiosRequestConfig } from "axios";
import React, { useEffect, useRef, useState } from "react";

type Params =
{
    TNN: number
    FNn: number
    FNP: number
    FnN: number
    Tnn: number
    FnP: number
    FPN: number
    FPn: number
    TPP: number
    Accuracy: number
    Precision: number[]
    Recall: number[]
    F1: number[]
    KFoldCV: number[]
    GridSearchCV:
    {
        Score: number
        BestParams: {}
    }
}

type Predictions =
{
    LinearRegression              : number
    KNearestNeighbors             : number
    SupportVectorClassification   : number
    NaiveBayes                    : number
    DecisionTreeClassification    : number
    RandomForestClassification    : number
    XGBoostClassification         : number
}

export default function PageNaturalLanguageProcessing() : any
{
    const url : string = 'http://localhost:8000/machine-learning/natural-language-processing/';

    const [logisticRegression, setLogisticRegression] = useState<Params>();

    const [kNearestNeighbors, setKNearestNeighbors] = useState<Params>();

    const [supportVector, setSupportVector] = useState<Params>();

    const [naiveBayes, setNaiveBayes] = useState<Params>();

    const [decisionTree, setDecisionTree] = useState<Params>();

    const [randomForest, setRandomForest] = useState<Params>();

    const [xGBoost, setXGBoost] = useState<Params>();

    const [sentence, setSentence] = useState<string>('');

    const [predictions, setPredictions] = useState<Predictions>();

    // >>> HTTP GET to retrieve dataset data
    async function dataset()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get(url + 'dataset', config).catch( (error : any) => { return; });

        if (response == undefined) return;
    }

    // >>> HTTP GET to retrieve logistic regression data
    async function logistic_regression()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get(url + 'logistic-regression', config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setLogisticRegression(
            {
                TNN: response.data['TNN'],
                FNn: response.data['FNn'],
                FNP: response.data['FNP'],
                FnN: response.data['FnN'],
                Tnn: response.data['Tnn'],
                FnP: response.data['FnP'],
                FPN: response.data['FPN'],
                FPn: response.data['FPn'],
                TPP: response.data['TPP'],
                Accuracy: response.data['Accuracy'],
                Precision: response.data['Precision'],
                Recall: response.data['Recall'],
                F1: response.data['F1'],
                KFoldCV: response.data['KFoldCV'],
                GridSearchCV:
                {
                    Score: response.data['GridSearchCV']['Score'],
                    BestParams: response.data['GridSearchCV']['BestParams'],
                }
            }
        );
    }

    // >>> HTTP GET to retrieve k-nearest neighbors data
    async function k_nearest_neighbors()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get(url + 'k-nearest-neighbors', config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setKNearestNeighbors(
            {
                TNN: response.data['TNN'],
                FNn: response.data['FNn'],
                FNP: response.data['FNP'],
                FnN: response.data['FnN'],
                Tnn: response.data['Tnn'],
                FnP: response.data['FnP'],
                FPN: response.data['FPN'],
                FPn: response.data['FPn'],
                TPP: response.data['TPP'],
                Accuracy: response.data['Accuracy'],
                Precision: response.data['Precision'],
                Recall: response.data['Recall'],
                F1: response.data['F1'],
                KFoldCV: response.data['KFoldCV'],
                GridSearchCV:
                {
                    Score: response.data['GridSearchCV']['Score'],
                    BestParams: response.data['GridSearchCV']['BestParams'],
                }
            }
        );
    }

    // >>> HTTP GET to retrieve support vector for classification data
    async function support_vector()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get(url + 'support-vector-classification', config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setSupportVector(
            {
                TNN: response.data['TNN'],
                FNn: response.data['FNn'],
                FNP: response.data['FNP'],
                FnN: response.data['FnN'],
                Tnn: response.data['Tnn'],
                FnP: response.data['FnP'],
                FPN: response.data['FPN'],
                FPn: response.data['FPn'],
                TPP: response.data['TPP'],
                Accuracy: response.data['Accuracy'],
                Precision: response.data['Precision'],
                Recall: response.data['Recall'],
                F1: response.data['F1'],
                KFoldCV: response.data['KFoldCV'],
                GridSearchCV:
                {
                    Score: response.data['GridSearchCV']['Score'],
                    BestParams: response.data['GridSearchCV']['BestParams'],
                }
            }
        );
    }

    // >>> HTTP GET to retrieve naive bayes data
    async function naive_bayes()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get(url + 'naive-bayes', config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setNaiveBayes(
            {
                TNN: response.data['TNN'],
                FNn: response.data['FNn'],
                FNP: response.data['FNP'],
                FnN: response.data['FnN'],
                Tnn: response.data['Tnn'],
                FnP: response.data['FnP'],
                FPN: response.data['FPN'],
                FPn: response.data['FPn'],
                TPP: response.data['TPP'],
                Accuracy: response.data['Accuracy'],
                Precision: response.data['Precision'],
                Recall: response.data['Recall'],
                F1: response.data['F1'],
                KFoldCV: response.data['KFoldCV'],
                GridSearchCV:
                {
                    Score: response.data['GridSearchCV']['Score'],
                    BestParams: response.data['GridSearchCV']['BestParams'],
                }
            }
        );
    }

    // >>> HTTP GET to retrieve decision tree data
    async function decision_tree()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get(url + 'decision-tree-classification', config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setDecisionTree(
            {
                TNN: response.data['TNN'],
                FNn: response.data['FNn'],
                FNP: response.data['FNP'],
                FnN: response.data['FnN'],
                Tnn: response.data['Tnn'],
                FnP: response.data['FnP'],
                FPN: response.data['FPN'],
                FPn: response.data['FPn'],
                TPP: response.data['TPP'],
                Accuracy: response.data['Accuracy'],
                Precision: response.data['Precision'],
                Recall: response.data['Recall'],
                F1: response.data['F1'],
                KFoldCV: response.data['KFoldCV'],
                GridSearchCV:
                {
                    Score: response.data['GridSearchCV']['Score'],
                    BestParams: response.data['GridSearchCV']['BestParams'],
                }
            }
        );
    }

    // >>> HTTP GET to retrieve random forest data
    async function random_forest()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get(url + 'random-forest-classification', config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setRandomForest(
            {
                TNN: response.data['TNN'],
                FNn: response.data['FNn'],
                FNP: response.data['FNP'],
                FnN: response.data['FnN'],
                Tnn: response.data['Tnn'],
                FnP: response.data['FnP'],
                FPN: response.data['FPN'],
                FPn: response.data['FPn'],
                TPP: response.data['TPP'],
                Accuracy: response.data['Accuracy'],
                Precision: response.data['Precision'],
                Recall: response.data['Recall'],
                F1: response.data['F1'],
                KFoldCV: response.data['KFoldCV'],
                GridSearchCV:
                {
                    Score: response.data['GridSearchCV']['Score'],
                    BestParams: response.data['GridSearchCV']['BestParams'],
                }
            }
        );
    }

    // >>> HTTP GET to retrieve xg boost data
    async function x_g_boost()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.get(url + 'x-g-boost-classification', config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setXGBoost(
            {
                TNN: response.data['TNN'],
                FNn: response.data['FNn'],
                FNP: response.data['FNP'],
                FnN: response.data['FnN'],
                Tnn: response.data['Tnn'],
                FnP: response.data['FnP'],
                FPN: response.data['FPN'],
                FPn: response.data['FPn'],
                TPP: response.data['TPP'],
                Accuracy: response.data['Accuracy'],
                Precision: response.data['Precision'],
                Recall: response.data['Recall'],
                F1: response.data['F1'],
                KFoldCV: response.data['KFoldCV'],
                GridSearchCV:
                {
                    Score: response.data['GridSearchCV']['Score'],
                    BestParams: response.data['GridSearchCV']['BestParams'],
                }
            }
        );
    }    

    // >>> HTTP GET to retrieve data
    async function get_data()
    {
        await dataset();

        await logistic_regression();

        await k_nearest_neighbors();

        await support_vector();

        await naive_bayes();

        await decision_tree();

        await random_forest();

        await x_g_boost();
    }

    // >>> HTTP PUT to check a sentence
    async function put_check_sentence()
    {
        // * Settings

        let config : AxiosRequestConfig<any> = { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

        // * Dataset

        let response : any = await axios.put(url + 'check-sentence/' + sentence, config).catch( (error : any) => { return; });

        if (response == undefined) return;

        setPredictions(
            {
                LinearRegression              : Number(response.data['LinearRegression']),
                KNearestNeighbors             : Number(response.data['KNearestNeighbors']),
                SupportVectorClassification   : Number(response.data['SupportVectorClassification']),
                NaiveBayes                    : Number(response.data['NaiveBayes']),
                DecisionTreeClassification    : Number(response.data['DecisionTreeClassification']),
                RandomForestClassification    : Number(response.data['RandomForestClassification']),
                XGBoostClassification         : Number(response.data['XGBoostClassification'])
            }
        );
    }

    // --- Use Effect 
    
    useEffect(() => { get_data() }, []);

    // --- Rendering 

    return (
        <div>

            <div className="chart-params">
                <label>Predict: </label>
                <input className="w-full" type="text" value={sentence} onChange={ (e) => { setSentence(e.target.value) } } placeholder="Insert a sentence..." required />
                <button className="action-button" onClick={ () => { if (sentence !== "") put_check_sentence() } }>Check</button>
            </div>

            <div className="flex flex-col w-full h-full overflow-auto text-green-300 shadow-md shadow-green-300 rounded-4xl bg-clip-border border-4 border-green-300">
            
                <table className="w-full table-auto font-mono">

                    <thead className="bg-sky-800 text-2xl">
                        <tr className="border-b-2 border-green-300">
                            <th className="border-r-2 border-green-300">Algorithm</th>
                            <th>Accuracy</th>
                            <th>Precision</th>
                            <th>Recall</th>
                            <th>F1</th>
                            <th>K-Fold CV</th>
                            <th>Grid Search CV</th>
                            <th>GSCV Best Params</th>
                            <th>Prediction</th>
                        </tr>
                    </thead>

                    <tbody className="bg-sky-900 text-2xl text-center">
                        <tr>
                            <td className="text-left border-r-2 border-green-300">Logistic Regression</td>
                            <td>{Number(logisticRegression?.Accuracy).toFixed(2) + ' %'}</td>
                            <td>{logisticRegression?.Precision.map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{logisticRegression?.Recall.map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{logisticRegression?.F1.map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{logisticRegression?.KFoldCV.map( (e : number, index : number) => { return (!index ? '' : ' +- ') + Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{Number(logisticRegression?.GridSearchCV.Score).toFixed(2) + ' %'}</td>
                            <td>{JSON.stringify(logisticRegression?.GridSearchCV.BestParams)}</td>
                            <td>
                                {predictions?.LinearRegression === 0 && <Icon icon='material-symbols:sentiment-dissatisfied-rounded' width={48} height={48} color='#FF0000' className='m-auto' /> }
                                {predictions?.LinearRegression === 1 && <Icon icon='material-symbols:sentiment-neutral-rounded' width={48} height={48} color='#808080' className='m-auto' />}
                                {predictions?.LinearRegression === 2 && <Icon icon='material-symbols:sentiment-satisfied-rounded' width={48} height={48} color='#00FF00' className='m-auto' />}
                            </td>
                        </tr>

                        <tr>
                            <td className="text-left border-r-2 border-green-300">K-Nearest Neighbors</td>
                            <td>{Number(kNearestNeighbors?.Accuracy).toFixed(2) + ' %'}</td>
                            <td>{kNearestNeighbors?.Precision.map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{kNearestNeighbors?.Recall.map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{kNearestNeighbors?.F1.map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{kNearestNeighbors?.KFoldCV.map( (e : number, index : number) => { return (!index ? '' : ' +- ') + Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{Number(kNearestNeighbors?.GridSearchCV.Score).toFixed(2) + ' %'}</td>
                            <td>{JSON.stringify(kNearestNeighbors?.GridSearchCV.BestParams)}</td>
                            <td>
                                {predictions?.KNearestNeighbors === 0 && <Icon icon='material-symbols:sentiment-dissatisfied-rounded' width={48} height={48} color='#FF0000' className='m-auto' /> }
                                {predictions?.KNearestNeighbors === 1 && <Icon icon='material-symbols:sentiment-neutral-rounded' width={48} height={48} color='#808080' className='m-auto' />}
                                {predictions?.KNearestNeighbors === 2 && <Icon icon='material-symbols:sentiment-satisfied-rounded' width={48} height={48} color='#00FF00' className='m-auto' />}
                            </td>
                        </tr>

                        <tr>
                            <td className="text-left border-r-2 border-green-300">Support Vector Classification</td>
                            <td>{Number(supportVector?.Accuracy).toFixed(2) + ' %'}</td>
                            <td>{supportVector?.Precision.map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{supportVector?.Recall.map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{supportVector?.F1.map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{supportVector?.KFoldCV.map( (e : number, index : number) => { return (!index ? '' : ' +- ') + Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{Number(supportVector?.GridSearchCV.Score).toFixed(2) + ' %'}</td>
                            <td>{JSON.stringify(supportVector?.GridSearchCV.BestParams)}</td>
                            <td>
                                {predictions?.SupportVectorClassification === 0 && <Icon icon='material-symbols:sentiment-dissatisfied-rounded' width={48} height={48} color='#FF0000' className='m-auto' /> }
                                {predictions?.SupportVectorClassification === 1 && <Icon icon='material-symbols:sentiment-neutral-rounded' width={48} height={48} color='#808080' className='m-auto' />}
                                {predictions?.SupportVectorClassification === 2 && <Icon icon='material-symbols:sentiment-satisfied-rounded' width={48} height={48} color='#00FF00' className='m-auto' />}
                            </td>
                        </tr>

                        <tr>
                            <td className="text-left border-r-2 border-green-300">Naive Bayes</td>
                            <td>{Number(naiveBayes?.Accuracy).toFixed(2) + ' %'}</td>
                            <td>{naiveBayes?.Precision.map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{naiveBayes?.Recall.map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{naiveBayes?.F1.map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{naiveBayes?.KFoldCV.map( (e : number, index : number) => { return (!index ? '' : ' +- ') + Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{Number(naiveBayes?.GridSearchCV.Score).toFixed(2) + ' %'}</td>
                            <td>{JSON.stringify(naiveBayes?.GridSearchCV.BestParams)}</td>
                            <td>
                                {predictions?.NaiveBayes === 0 && <Icon icon='material-symbols:sentiment-dissatisfied-rounded' width={48} height={48} color='#FF0000' className='m-auto' /> }
                                {predictions?.NaiveBayes === 1 && <Icon icon='material-symbols:sentiment-neutral-rounded' width={48} height={48} color='#808080' className='m-auto' />}
                                {predictions?.NaiveBayes === 2 && <Icon icon='material-symbols:sentiment-satisfied-rounded' width={48} height={48} color='#00FF00' className='m-auto' />}
                            </td>
                        </tr>

                        <tr>
                            <td className="text-left border-r-2 border-green-300">Decision Tree</td>
                            <td>{Number(decisionTree?.Accuracy).toFixed(2) + ' %'}</td>
                            <td>{decisionTree?.Precision.map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{decisionTree?.Recall.map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{decisionTree?.F1.map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{decisionTree?.KFoldCV.map( (e : number, index : number) => { return (!index ? '' : ' +- ') + Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{Number(decisionTree?.GridSearchCV.Score).toFixed(2) + ' %'}</td>
                            <td>{JSON.stringify(decisionTree?.GridSearchCV.BestParams)}</td>
                            <td>
                                {predictions?.DecisionTreeClassification === 0 && <Icon icon='material-symbols:sentiment-dissatisfied-rounded' width={48} height={48} color='#FF0000' className='m-auto' /> }
                                {predictions?.DecisionTreeClassification === 1 && <Icon icon='material-symbols:sentiment-neutral-rounded' width={48} height={48} color='#808080' className='m-auto' />}
                                {predictions?.DecisionTreeClassification === 2 && <Icon icon='material-symbols:sentiment-satisfied-rounded' width={48} height={48} color='#00FF00' className='m-auto' />}
                            </td>
                        </tr>

                        <tr>
                            <td className="text-left border-r-2 border-green-300">Random Forest</td>
                            <td>{Number(randomForest?.Accuracy).toFixed(2) + ' %'}</td>
                            <td>{randomForest?.Precision.map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{randomForest?.Recall.map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{randomForest?.F1.map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{randomForest?.KFoldCV.map( (e : number, index : number) => { return (!index ? '' : ' +- ') + Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{Number(randomForest?.GridSearchCV.Score).toFixed(2) + ' %'}</td>
                            <td>{JSON.stringify(randomForest?.GridSearchCV.BestParams)}</td>
                            <td>
                                {predictions?.RandomForestClassification === 0 && <Icon icon='material-symbols:sentiment-dissatisfied-rounded' width={48} height={48} color='#FF0000' className='m-auto' /> }
                                {predictions?.RandomForestClassification === 1 && <Icon icon='material-symbols:sentiment-neutral-rounded' width={48} height={48} color='#808080' className='m-auto' />}
                                {predictions?.RandomForestClassification === 2 && <Icon icon='material-symbols:sentiment-satisfied-rounded' width={48} height={48} color='#00FF00' className='m-auto' />}
                            </td>
                        </tr>

                        <tr className="border-b-2 border-green-300">
                            <td className="text-left border-r-2 border-green-300">XG Boost</td>
                            <td>{Number(xGBoost?.Accuracy).toFixed(2) + ' %'}</td>
                            <td>{xGBoost?.Precision.map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{xGBoost?.Recall.map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{xGBoost?.F1.map( (e : number) => { return Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{xGBoost?.KFoldCV.map( (e : number, index : number) => { return (!index ? '' : ' +- ') + Number(e).toFixed(2) + ' % ' } )}</td>
                            <td>{Number(xGBoost?.GridSearchCV.Score).toFixed(2) + ' %'}</td>
                            <td>{JSON.stringify(xGBoost?.GridSearchCV.BestParams)}</td>
                            <td>
                                {predictions?.XGBoostClassification === 0 && <Icon icon='material-symbols:sentiment-dissatisfied-rounded' width={48} height={48} color='#FF0000' className='m-auto' /> }
                                {predictions?.XGBoostClassification === 1 && <Icon icon='material-symbols:sentiment-neutral-rounded' width={48} height={48} color='#808080' className='m-auto' />}
                                {predictions?.XGBoostClassification === 2 && <Icon icon='material-symbols:sentiment-satisfied-rounded' width={48} height={48} color='#00FF00' className='m-auto' />}
                            </td>
                        </tr>
                    </tbody>

                    <caption className="bg-sky-900 caption-bottom h-10 pt-2">
                        For Precision, Recall, and F1 are listed the values for Negative, Neutral, and Positive results. For
                        K-Fold Cross Validation are listed mean and standard deviation. [CV = Cross Validation]
                    </caption>

                </table>

            </div>

            <div className="description">
                <h1 className="description-title">Natural Language Processing</h1>
                <p>
                    Natural language processing is a subfield of AI that applies machine learning techniques to enable computers to understand, interpret, and generate human language.
                    In essence, ML provides the foundational methods, while NLP specializes them for processing linguistic data, making applications like chatbots, language translation,
                    and voice assistants possible. 
                    There is an algorithm used together with classification methods:
                </p>
                <ul className="list-disc pl-8 space-y-4 mt-4">
                    <li><strong>Bag Of Words</strong></li>
                </ul>
            </div>

        </div>
    );
}