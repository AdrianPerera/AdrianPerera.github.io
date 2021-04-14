function dateConverter(match, p1, p2, p3, offset, string) {
    var mS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    p2 = mS[parseInt(p2) - 1];
    p1 = "20" + p1;
    return [p2, p3, p1].join(' ');
}

fetch('bitcoin.json')
    .then(res => res.json())
    .then(data => {
        const chart = new G2.Chart({
            container: 'container',
            autoFit: true,
            height: 450,
            padding: [40, 45, 50, 80],
            animate: false
        })

        chart.data(data);

        chart.axis('date', {
            label: {
                formatter: text => {
                    return text.replace(/(\d{2})-(\d{2})-(\d{2})/g, dateConverter);
                }
            }
        });

        chart.axis('value', {
            label: {
                formatter: text => {
                    if (text === "0") {
                        return "0";
                    } else {
                        return "$" + text.substr(0, text.length - 3) + "k";
                    }
                }
            }
        });

        chart.scale({
            date: {
                tickCount: 8
            },
            value: {
                type: 'linear',
                tickCount:8,
            }
          });

        chart.legend({
            custom: true,
            items: [
                { name: 'crypto', value: 'value', marker: { symbol: 'line', style: { stroke: '#1890ff', lineWidth: 2 } } },

            ],
        });
        chart.line().position('date*value').color('#1890ff');
        chart.render();

    });
