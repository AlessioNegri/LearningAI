import { TitleOptions, Tooltip } from "chart.js";

// >>> Prepare the Chart.js options
export function chart_js_options(title: string = "Market Basket"): any
{
    // * Title

    const plugins_title : TitleOptions =
    {
        align: "center",
        display: true,
        position: "top",
        color: "rgb(255, 255, 255)",
        font:
        {
            family: "Arial",
            size: 20,
        },
        fullSize: false,
        padding: 10,
        text: title
    }

    // * Options

    const options : any =
    {
        responsive: true,
        maintainAspectRatio: false,
        plugins:
        {
            legend:
            {
                labels:
                {
                    color: "rgb(255, 255, 255)",
                    font:
                    {
                        family: "Arial",
                        size: 20,
                    },
                },
                position: "bottom",
                align: "center"
            },
            title: plugins_title,
            tooltip:
            {
                titleFont:
                {
                    family: "Arial",
                    size: 20,
                },
                bodyFont:
                {
                    family: "Arial",
                    size: 20,
                }
            }
        },
        scales:
        {
            r:
            {
                grid:
                {
                    display: true,
                    color: "#FFFFFF80"
                },
                ticks:
                {
                    color: "rgb(255, 255, 255)",
                    backdropColor: "rgb(255, 255, 255, 0)",
                    font:
                    {
                        family: "Nunito",
                        size: 24,
                        weight: "bold"
                    }
                },
                pointLabels:
                {
                    display: true,
                    centerPointLabels: true,
                    color: "rgb(255, 255, 255)",
                    backdropColor: "rgb(0, 0, 80)",
                    borderRadius: 10,
                    font:
                    {
                        family: "Nunito",
                        size: 24,
                        weight: "bold"
                    }
                }
            }
        }
    }

    // * Return

    return options
}

// >>> Generate a random color string
export function getRandomColor()
{
    var letters = '0123456789ABCDEF';

    var color = '#';

    for (var i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
    
    return color;
}