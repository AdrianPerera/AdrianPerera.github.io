function dateConverter(match, p1, p2, p3, offset, string) {
    var mS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    p2 = mS[parseInt(p2) - 1];
    p1 = "20" + p1;
    return [p2, p3, p1].join(' ');
}

fetch('bitcoin.json')
    .then(res => res.json())
    .then(data => {
        const ds = new DataSet({
            state: {
                start: '13-10-10',
                end: '19-12-12'
            }
        });
        const dv = ds.createView('origin').source(data);
        dv.transform({
            type: 'filter',
            callback: function callbaack(obj) {
                const date = obj.date;
                return date >= ds.state.start && date <= ds.state.end;

            }
        });

        const chart = new G2.Chart({
            container: 'container',
            forceFit: true,
            height: 400,
            padding: [40, 40, 40, 60],
            animate: false
        });

        chart.source(dv, {
            date: {
                tickCount: 10
            },
            value: {
                type: 'linear',
                tickInterval: 2000
            }
        });
        chart.axis('date', {
            label: {
                formatter: text => {
                    return text.replace(/(\d{2})-(\d{2})-(\d{2})/g, dateConverter);
                }
            }

        });

        chart.axis('value', {
            label: {
                textStyle: {
                    fill: '#aaaaaa'
                }
            },
            grid: {
                type: 'line',
                lineStyle: {
                    stroke: '#d9d9d0',
                    lineWidth: 1.5,
                    lineDash: [4, 4]
                },
                align: 'center' // 网格顶点从两个刻度中间开始
            }
        });
        chart.line()
            .position('date*value')
            .color('black')
            .opacity(0.85)
            .size(0.75);
        chart.render();


        chart.interact('slider', {
            container: 'slider',
            padding: [40, 40, 40, 60],
            onChange: function slider(ev) {
                const { startValue, endValue } = ev;
                ds.setState('start', startValue);
                ds.setState('end', endValue);
            }
        })
        chart.interact('brush', {
            type: 'X',
            onBrushstart() {

            }, onBrushend(event) {
                let arrayLength = event.date.length;
                let startingDate = event.date[0];
                let endingDate = event.date[arrayLength - 1];
                $('#starting_date').text(startingDate.replace(/(\d{2})-(\d{2})-(\d{2})/g, dateConverter));
                $('#ending_date').text(endingDate.replace(/(\d{2})-(\d{2})-(\d{2})/g, dateConverter));
                var dcaValue = 0, dailyvalue = 0;
                for (var i in event.value) {
                    dailyvalue += parseFloat(event.value[i]);
                }
                dcaValue = "$ " + (dailyvalue / arrayLength).toFixed(2);
                console.log(dailyvalue, arrayLength, dcaValue);
                $('#dca_value').text(dcaValue);
            }
        });


    });
