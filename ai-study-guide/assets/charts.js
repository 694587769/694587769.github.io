(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var success = style.getPropertyValue('--success').trim();
  var danger = style.getPropertyValue('--danger').trim();

  // 根据容器宽度自适应图表字体大小
  function chartFontSize(containerId, baseSize) {
    var el = document.getElementById(containerId);
    var w = el ? el.clientWidth : 600;
    var scaled = baseSize * (w / 650);
    return Math.max(9, Math.min(baseSize, Math.round(scaled)));
  }

  function resizeAllCharts() {
    [chart1, chart2, chart3, chart4, chart5, chart6, chart7, chart8, chart9, chart10].forEach(function(c) {
      if (c && !c.isDisposed()) c.resize();
    });
  }

  // ===== Chart 1: Confusion Matrix =====
  var chart1 = echarts.init(document.getElementById('chart-confusion'), null, { renderer: 'svg' });
  function cmColor(v) {
    var t = v / 80;
    var r = Math.round(224 + (37 - 224) * t);
    var g = Math.round(231 + (99 - 231) * t);
    var b = Math.round(255 + (235 - 255) * t);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  chart1.setOption({
    animation: false,
    tooltip: {
      position: 'top',
      formatter: function(p) {
        var names = ['负例', '正例'];
        return names[p.value[1]] + ' / 预测' + names[p.value[0]] + ': <strong>' + p.value[2] + '</strong>';
      }
    },
    grid: { top: 30, bottom: 30, left: 60, right: 30 },
    xAxis: {
      type: 'category',
      data: ['预测负例', '预测正例'],
      axisLine: { lineStyle: { color: muted } },
      axisLabel: { color: ink, fontWeight: 'bold' },
      splitArea: { show: true, areaStyle: { color: ['rgba(0,0,0,0)'] } }
    },
    yAxis: {
      type: 'category',
      data: ['真实正例', '真实负例'],
      axisLine: { lineStyle: { color: muted } },
      axisLabel: { color: ink, fontWeight: 'bold' },
      splitArea: { show: true, areaStyle: { color: ['rgba(0,0,0,0)'] } }
    },
    series: [{
      type: 'heatmap',
      data: [[0,0,15,'FN'], [1,0,65,'TP'], [0,1,70,'TN'], [1,1,10,'FP']],
      label: {
        show: true,
        formatter: function(p) {
          var labels = { 'FN': 'FN=15', 'TP': 'TP=65', 'TN': 'TN=70', 'FP': 'FP=10' };
          return labels[p.value[3]];
        },
        fontSize: chartFontSize('chart-confusion', 14), fontWeight: 'bold', color: ink
      },
      itemStyle: {
        borderWidth: 2,
        borderColor: '#ffffff',
        color: function(p) { return cmColor(p.value[2]); }
      }
    }]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // ===== Chart 2: ROC Curve =====
  var chart2 = echarts.init(document.getElementById('chart-roc'), null, { renderer: 'svg' });
  var rocData = [];
  for (var i = 0; i <= 100; i++) {
    var fpr = i / 100;
    rocData.push([fpr, 1 - Math.pow(1 - fpr, 1.5)]);
  }
  chart2.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { top: 40, bottom: 50, left: 60, right: 40 },
    xAxis: {
      type: 'value', name: '假正率 (FPR)', min: 0, max: 1,
      nameLocation: 'middle', nameGap: 30,
      axisLine: { lineStyle: { color: muted } },
      splitLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value', name: '真正率 (TPR)', min: 0, max: 1,
      nameLocation: 'middle', nameGap: 40,
      axisLine: { lineStyle: { color: muted } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [
      {
        type: 'line', data: rocData, smooth: true,
        lineStyle: { color: accent, width: 3 },
        symbol: 'none',
        areaStyle: { color: accent + '22' }
      },
      {
        type: 'line', data: [[0,0],[1,1]],
        lineStyle: { color: muted, type: 'dashed', width: 2 },
        symbol: 'none',
        name: '随机猜测'
      }
    ]
  });
  window.addEventListener('resize', function() { chart2.resize(); });

  // ===== Chart 3: Activation Functions =====
  var chart3 = echarts.init(document.getElementById('chart-activations'), null, { renderer: 'svg' });
  var xVals = [];
  for (var i = -50; i <= 50; i++) xVals.push(i / 10);
  function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
  function relu(x) { return Math.max(0, x); }
  function tanh(x) { return Math.tanh(x); }
  function gelu(x) { return 0.5 * x * (1 + Math.tanh(Math.sqrt(2/Math.PI) * (x + 0.044715 * x * x * x))); }
  chart3.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { top: 10, data: ['Sigmoid', 'Tanh', 'ReLU', 'GELU'] },
    grid: { top: 60, bottom: 50, left: 60, right: 40 },
    xAxis: {
      type: 'category', data: xVals,
      axisLine: { lineStyle: { color: muted } },
      axisLabel: { interval: 9, color: muted }
    },
    yAxis: {
      type: 'value', min: -1.2, max: 1.2,
      axisLine: { lineStyle: { color: muted } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [
      { name: 'Sigmoid', type: 'line', data: xVals.map(sigmoid), smooth: true, symbol: 'none', lineStyle: { width: 2 } },
      { name: 'Tanh', type: 'line', data: xVals.map(tanh), smooth: true, symbol: 'none', lineStyle: { width: 2 } },
      { name: 'ReLU', type: 'line', data: xVals.map(relu), smooth: false, symbol: 'none', lineStyle: { width: 2 } },
      { name: 'GELU', type: 'line', data: xVals.map(gelu), smooth: true, symbol: 'none', lineStyle: { width: 2 } }
    ],
    color: [accent, accent2, success, danger]
  });
  window.addEventListener('resize', function() { chart3.resize(); });

  // ===== Chart 4: LR Schedule =====
  var chart4 = echarts.init(document.getElementById('chart-lr-schedule'), null, { renderer: 'svg' });
  var epochs = [];
  for (var i = 0; i <= 100; i++) epochs.push(i);
  function stepDecay(e) {
    var lr = 0.1;
    if (e >= 30) lr = 0.01;
    if (e >= 60) lr = 0.001;
    if (e >= 80) lr = 0.0001;
    return lr;
  }
  function cosineAnnealing(e) {
    return 0.001 + 0.5 * (0.1 - 0.001) * (1 + Math.cos(e / 100 * Math.PI));
  }
  function warmupCosine(e) {
    if (e < 5) return 0.1 * (e / 5);
    return 0.001 + 0.5 * (0.1 - 0.001) * (1 + Math.cos((e - 5) / 95 * Math.PI));
  }
  chart4.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { top: 10, data: ['Step Decay', 'Cosine Annealing', 'Warmup + Cosine'] },
    grid: { top: 60, bottom: 50, left: 70, right: 40 },
    xAxis: {
      type: 'category', data: epochs,
      name: 'Epoch', nameLocation: 'middle', nameGap: 30,
      axisLine: { lineStyle: { color: muted } },
      axisLabel: { interval: 9, color: muted }
    },
    yAxis: {
      type: 'value', name: '学习率',
      nameLocation: 'middle', nameGap: 45,
      axisLine: { lineStyle: { color: muted } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [
      { name: 'Step Decay', type: 'line', data: epochs.map(stepDecay), symbol: 'none', lineStyle: { width: 2 } },
      { name: 'Cosine Annealing', type: 'line', data: epochs.map(cosineAnnealing), smooth: true, symbol: 'none', lineStyle: { width: 2 } },
      { name: 'Warmup + Cosine', type: 'line', data: epochs.map(warmupCosine), smooth: true, symbol: 'none', lineStyle: { width: 2 } }
    ],
    color: [accent, accent2, success]
  });
  window.addEventListener('resize', function() { chart4.resize(); });

  // ===== Chart 5: Optimizer Convergence =====
  var chart5 = echarts.init(document.getElementById('chart-optimizers'), null, { renderer: 'svg' });
  var optIters = [];
  for (var i = 0; i <= 200; i++) optIters.push(i);
  function sgdLoss(i) { return Math.exp(-0.01 * i) * (1 + 0.3 * Math.sin(i * 0.3)) + 0.05; }
  function momentumLoss(i) { return Math.exp(-0.015 * i) * (1 + 0.15 * Math.sin(i * 0.2)) + 0.05; }
  function adamLoss(i) { return Math.exp(-0.025 * i) + 0.05; }
  chart5.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { top: 10, data: ['SGD', 'SGD+Momentum', 'Adam'] },
    grid: { top: 60, bottom: 50, left: 70, right: 40 },
    xAxis: {
      type: 'category', data: optIters,
      name: '迭代次数', nameLocation: 'middle', nameGap: 30,
      axisLine: { lineStyle: { color: muted } },
      axisLabel: { interval: 19, color: muted }
    },
    yAxis: {
      type: 'value', name: '损失值',
      nameLocation: 'middle', nameGap: 45,
      axisLine: { lineStyle: { color: muted } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [
      { name: 'SGD', type: 'line', data: optIters.map(sgdLoss), smooth: true, symbol: 'none', lineStyle: { width: 2 } },
      { name: 'SGD+Momentum', type: 'line', data: optIters.map(momentumLoss), smooth: true, symbol: 'none', lineStyle: { width: 2 } },
      { name: 'Adam', type: 'line', data: optIters.map(adamLoss), smooth: true, symbol: 'none', lineStyle: { width: 2 } }
    ],
    color: [accent, accent2, success]
  });
  window.addEventListener('resize', function() { chart5.resize(); });

  // ===== Chart 6: Loss Function Comparison =====
  var chart6 = echarts.init(document.getElementById('chart-loss-compare'), null, { renderer: 'svg' });
  var lossX = [];
  for (var i = -80; i <= 80; i++) lossX.push(i / 40);
  function mseLoss(y) { return y * y; }
  function bceLoss(y) {
    var p = 1 / (1 + Math.exp(-y));
    return -(1 * Math.log(p + 1e-8) + (1-1) * Math.log(1 - p + 1e-8));
  }
  chart6.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { top: 10, data: ['MSE (y=1)', 'BCE (y=1)'] },
    grid: { top: 60, bottom: 50, left: 70, right: 40 },
    xAxis: {
      type: 'category', data: lossX,
      name: '预测值 ŷ', nameLocation: 'middle', nameGap: 30,
      axisLine: { lineStyle: { color: muted } },
      axisLabel: { interval: 9, color: muted }
    },
    yAxis: {
      type: 'value', name: '损失值',
      nameLocation: 'middle', nameGap: 45,
      axisLine: { lineStyle: { color: muted } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [
      { name: 'MSE (y=1)', type: 'line', data: lossX.map(mseLoss), smooth: true, symbol: 'none', lineStyle: { width: 2 } },
      { name: 'BCE (y=1)', type: 'line', data: lossX.map(bceLoss), smooth: true, symbol: 'none', lineStyle: { width: 2 } }
    ],
    color: [accent, accent2]
  });
  window.addEventListener('resize', function() { chart6.resize(); });

  // ===== Chart 7: BERT Architecture (stacked bar) =====
  var chart7 = echarts.init(document.getElementById('chart-bert-arch'), null, { renderer: 'svg' });
  chart7.setOption({
    animation: false,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, appendToBody: true },
    legend: { top: 10, data: ['Embedding层', 'Self-Attention', 'FFN', 'LayerNorm'] },
    grid: { top: 60, bottom: 60, left: 120, right: 40 },
    xAxis: {
      type: 'value', name: '参数量 (百万)',
      nameLocation: 'middle', nameGap: 30,
      axisLine: { lineStyle: { color: muted } },
      splitLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'category',
      data: ['BERT-Base\n(12层)', 'BERT-Large\n(24层)'],
      axisLine: { lineStyle: { color: muted } },
      axisLabel: { color: ink, fontWeight: 'bold' }
    },
    series: [
      { name: 'Embedding层', type: 'bar', stack: 'total', data: [24, 31], itemStyle: { color: accent } },
      { name: 'Self-Attention', type: 'bar', stack: 'total', data: [42, 113], itemStyle: { color: accent2 } },
      { name: 'FFN', type: 'bar', stack: 'total', data: [42, 113], itemStyle: { color: success } },
      { name: 'LayerNorm', type: 'bar', stack: 'total', data: [2, 5], itemStyle: { color: muted } }
    ]
  });
  window.addEventListener('resize', function() { chart7.resize(); });

  // ===== Chart 8: Bias-Variance Tradeoff =====
  var chart8 = echarts.init(document.getElementById('chart-bias-variance'), null, { renderer: 'svg' });
  var xVals8 = [];
  for (var i = 0; i <= 20; i++) xVals8.push(i);
  function bias8(i) { return 5 * Math.exp(-0.3 * i); }
  function variance8(i) { return 0.05 * i * i; }
  function total8(i) { return bias8(i) + variance8(i) + 0.5; }
  function irreducible8() { return 0.5; }
  chart8.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { top: 10, data: ['偏差^2', '方差', '不可约误差', '总误差'] },
    grid: { top: 60, bottom: 50, left: 60, right: 40 },
    xAxis: {
      type: 'category', data: xVals8.map(function(v) { return v; }),
      name: '模型复杂度 →', nameLocation: 'middle', nameGap: 30,
      axisLine: { lineStyle: { color: muted } },
      axisLabel: { color: muted, formatter: function(v) { var labels = ['简单','','','','','','','','','中等','','','','','','','','','','','复杂']; return labels[v] || ''; } }
    },
    yAxis: {
      type: 'value', name: '误差', min: 0,
      nameLocation: 'middle', nameGap: 40,
      axisLine: { lineStyle: { color: muted } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [
      { name: '偏差^2', type: 'line', data: xVals8.map(bias8), smooth: true, symbol: 'none', lineStyle: { width: 2 } },
      { name: '方差', type: 'line', data: xVals8.map(variance8), smooth: true, symbol: 'none', lineStyle: { width: 2 } },
      { name: '不可约误差', type: 'line', data: xVals8.map(irreducible8), lineStyle: { type: 'dashed', width: 2, color: muted }, symbol: 'none' },
      { name: '总误差', type: 'line', data: xVals8.map(total8), smooth: true, symbol: 'none', lineStyle: { width: 3, type: 'dashed' } }
    ],
    color: [accent2, accent, muted, danger]
  });
  window.addEventListener('resize', function() { chart8.resize(); });

  // ===== Chart 9: Attention Heatmap =====
  var chart9 = echarts.init(document.getElementById('chart-attention-heatmap'), null, { renderer: 'svg' });
  var attnData = [
    [0,0,0.82], [1,0,0.05], [2,0,0.10], [3,0,0.03],
    [0,1,0.15], [1,1,0.70], [2,1,0.10], [3,1,0.05],
    [0,2,0.10], [1,2,0.20], [2,2,0.60], [3,2,0.10],
    [0,3,0.05], [1,3,0.08], [2,3,0.15], [3,3,0.72]
  ];
  var attnLabels = { '0,0':'0.82','1,0':'0.05','2,0':'0.10','3,0':'0.03','0,1':'0.15','1,1':'0.70','2,1':'0.10','3,1':'0.05','0,2':'0.10','1,2':'0.20','2,2':'0.60','3,2':'0.10','0,3':'0.05','1,3':'0.08','2,3':'0.15','3,3':'0.72' };
  chart9.setOption({
    animation: false,
    tooltip: {
      position: 'top',
      formatter: function(p) { return 'Query: Token ' + p.value[0] + ', Key: Token ' + p.value[1] + ' → 权重: <strong>' + p.value[2].toFixed(2) + '</strong>'; }
    },
    grid: { top: 50, bottom: 60, left: 80, right: 40 },
    xAxis: {
      type: 'category', data: ['Token 0\n"电网"', 'Token 1\n"调度"', 'Token 2\n"优化"', 'Token 3\n"系统"'],
      axisLine: { lineStyle: { color: muted } },
      axisLabel: { color: ink, fontWeight: 'bold', fontSize: chartFontSize('chart-attention-heatmap', 11) }
    },
    yAxis: {
      type: 'category', data: ['Token 0\n"电网"', 'Token 1\n"调度"', 'Token 2\n"优化"', 'Token 3\n"系统"'],
      axisLine: { lineStyle: { color: muted } },
      axisLabel: { color: ink, fontWeight: 'bold', fontSize: chartFontSize('chart-attention-heatmap', 11) }
    },
    visualMap: { min: 0, max: 1, show: true, bottom: 0, left: 'center', orient: 'horizontal', inRange: { color: ['#f0f0f5', accent] }, text: ['强关注', '弱关注'] },
    series: [{
      type: 'heatmap', data: attnData,
      label: {
        show: true,
        formatter: function(p) { return p.value[2].toFixed(2); },
        fontSize: chartFontSize('chart-attention-heatmap', 13), fontWeight: 'bold', color: ink
      },
      itemStyle: { borderWidth: 2, borderColor: '#ffffff' }
    }]
  });
  window.addEventListener('resize', function() { chart9.resize(); });

  // ===== Chart 10: Scaling Law =====
  var chart10 = echarts.init(document.getElementById('chart-scaling-law'), null, { renderer: 'svg' });
  var nVals = [];
  for (var i = 0; i <= 50; i++) nVals.push(Math.pow(10, 6 + i * 0.1));
  var lossByN = nVals.map(function(n) { return 2.5 * Math.pow(n / 1e11, -0.076) + 0.8; });
  var lossByD = nVals.map(function(d) { return 2.5 * Math.pow(d / 1e11, -0.095) + 0.8; });
  var lossByC = nVals.map(function(c) { return 2.5 * Math.pow(c / 1e11, -0.050) + 0.8; });
  chart10.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true,
      formatter: function(params) {
        var n = params[0].axisValue;
        var s = '参数量/数据量: ' + (n/1e9).toFixed(1) + 'B<br/>';
        params.forEach(function(p) { s += p.seriesName + ': ' + p.value.toFixed(3) + '<br/>'; });
        return s;
      }
    },
    legend: { top: 10, data: ['模型参数量 N', '训练数据量 D', '计算量 C'] },
    grid: { top: 60, bottom: 60, left: 80, right: 40 },
    xAxis: {
      type: 'category', data: nVals.map(function(n) { return n; }),
      name: '参数量 / 数据量 (对数坐标)', nameLocation: 'middle', nameGap: 35,
      axisLine: { lineStyle: { color: muted } },
      axisLabel: { color: muted, formatter: function(v) { var b = v / 1e9; if (b >= 1) return (b/1e3).toFixed(0) + 'T'; if (b >= 1) return b.toFixed(0) + 'B'; return (b*1e3).toFixed(0) + 'M'; }, interval: 9 }
    },
    yAxis: {
      type: 'value', name: '测试损失', min: 0.5,
      nameLocation: 'middle', nameGap: 45,
      axisLine: { lineStyle: { color: muted } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [
      { name: '模型参数量 N', type: 'line', data: lossByN, smooth: true, symbol: 'none', lineStyle: { width: 3 } },
      { name: '训练数据量 D', type: 'line', data: lossByD, smooth: true, symbol: 'none', lineStyle: { width: 3 } },
      { name: '计算量 C', type: 'line', data: lossByC, smooth: true, symbol: 'none', lineStyle: { width: 3 } }
    ],
    color: [accent, accent2, success]
  });
  window.addEventListener('resize', function() { chart10.resize(); });

})();
