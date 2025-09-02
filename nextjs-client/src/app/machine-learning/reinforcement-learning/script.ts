import { TitleOptions } from 'chart.js';

// >>> Prepare the Chart.js options
export function chart_js_options(title: string = 'Machine Learning - Classification',
                                 y_label: string = 'Y-Axis Title'): any
{
    // * Title

    const plugins_title : TitleOptions =
    {
        text: title,
        align: 'center',
        position: 'top',
        color: 'rgb(255, 255, 255)',
        display: true,
        fullSize: true,
        padding: 10,
        font:
        {
            family: 'sans-serif',
            size: 30,
            weight: 'bold'
        }
    }

    // * Options

    const options : any =
    {
        responsive: true,
        maintainAspectRatio: false,
        plugins:
        {
            title: plugins_title,
            legend:
            {
                position: 'bottom',
                align: 'center',
                labels:
                {
                    color: 'rgb(255, 255, 255)',
                    font:
                    {
                        family: 'sans-serif',
                        size: 24,
                        weight: 'italic'
                    }
                }
            },
            tooltip:
            {
                titleFont:
                {
                    family: 'sans-serif',
                    size: 20,
                },
                bodyFont:
                {
                    family: 'sans-serif',
                    size: 20,
                }
            }
        },
        scales:
        {
            x:
            {
                title:
                {
                    display: true,
                    text: '',
                    align: 'center',
                    color: 'rgb(255, 255, 255)',
                    font:
                    {
                        family: 'sans-serif',
                        size: 24
                    },
                    padding:
                    {
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                    }
                },
                grid:
                {
                    display: true,
                    color: '#FFFFFF40'
                },
                ticks:
                {
                    color: 'rgb(255, 255, 255)',
                    font:
                    {
                        family: 'sans-serif',
                        size: 20
                    }
                }
            },
            y:
            {
                title:
                {
                    display: true,
                    text: y_label,
                    align: 'center',
                    color: 'rgb(255, 255, 255)',
                    font:
                    {
                        family: 'sans-serif',
                        size: 20
                    },
                    padding:
                    {
                        top: 0,
                        bottom: 30,
                        left: 0,
                        right: 0
                    }
                },
                grid:
                {
                    display: true,
                    color: '#FFFFFF40'
                },
                ticks:
                {
                    color: 'rgb(255, 255, 255)',
                    font:
                    {
                        family: 'sans-serif',
                        size: 20
                    }
                }
            }
        }
    }

    // * Return

    return options
}