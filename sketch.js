let table;
let treeTypes = {};
let bubbles = [];
let hoveredBubble = null;
let treeCounts = {}; // 全局变量定义


function preload() {
  // 预加载CSV文件
  table = loadTable('street-trees-cleaned.csv', 'csv', 'header');
}

function setup() {
  let canvas = createCanvas(windowWidth, 600); // 使用您的画布尺寸
    canvas.parent('chart-container'); 
 
  colorMode(HSB, 360, 100, 100);
  noStroke();

  // 分配颜色并生成气泡数据
  assignColorsToTreeTypes();
  generateBubbles();

  // 停止draw()的循环调用
  noLoop();
}

function draw() {
  // 清除背景
  background(255);

  // 绘制气泡和坐标轴
  drawBubbles();
  drawAxes();

  // 如果有气泡被悬浮，则显示悬浮信息
  if (hoveredBubble) {
    displayTreeTypeOnHover();
  }
}

function mouseMoved() {
  // 检查鼠标悬浮状态
  checkForHover();
  // 重绘一次
  redraw();
}
function assignColorsToTreeTypes() {
  // 填充 treeCounts
  for (let r = 0; r < table.getRowCount(); r++) {
    let commonName = table.getString(r, 'common_name');
    treeCounts[commonName] = (treeCounts[commonName] || 0) + 1;
  }

  // 为树木种类分配颜色
  let sortedTreeTypes = Object.keys(treeCounts).sort((a, b) => treeCounts[b] - treeCounts[a]).slice(0, 10);
  let i = 0;
  sortedTreeTypes.forEach(type => {
    treeTypes[type] = color((i * 360 / 10) % 360, 80, 80);
    i++;
  });
}




function generateBubbles() {
  let sortedTreeTypes = Object.keys(treeCounts).sort((a, b) => treeCounts[b] - treeCounts[a]).slice(0, 10);

  for (let r = 0; r < table.getRowCount(); r++) {
    const diameter = table.getNum(r, 'diameter');
    const heightRange = table.getString(r, 'height_range');
    const commonName = table.getString(r, 'common_name');
    const neighbourhoodName = table.getString(r, 'neighbourhood_name');

    if (!sortedTreeTypes.includes(commonName) || diameter > 60) continue;

    const heights = heightRange.split("' - ").map(h => parseInt(h.replace(/\D/g, '')));
    const averageHeight = (heights[0] + heights[1]) / 2;

    bubbles.push({
      x: map(diameter, 0, 60, 100, width - 100),
      y: map(averageHeight, 0, 80, height - 50, 50),
      diameter: 15,
      name: commonName,
      neighbourhoodName: neighbourhoodName,
      color: treeTypes[commonName], // 应用颜色
      textWidth: textWidth(commonName + "\n" + neighbourhoodName)
    });
  }
}




function drawBubbles() {
  for (let bubble of bubbles) {
    if (bubble.color instanceof p5.Color) {
      fill(bubble.color);
    } else {
      fill(255); // 如果颜色无效，使用默认颜色（如白色）
    }
    ellipse(bubble.x, bubble.y, bubble.diameter);
  }
}


function checkForHover() {
  // 检查鼠标是否悬浮在气泡上
  hoveredBubble = null;
  for (let bubble of bubbles) {
    let d = dist(mouseX, mouseY, bubble.x, bubble.y);
    if (d < bubble.diameter / 2) {
      hoveredBubble = bubble;
      break;
    }
  }
}

function displayTreeTypeOnHover() {
  if (hoveredBubble) {
    let textString = hoveredBubble.name + "\nArea: " + hoveredBubble.neighbourhoodName;
    let rectWidth = hoveredBubble.textWidth + 20;
    let rectHeight = 45; // 减少文本框高度
    let rectX = mouseX - rectWidth / 2;
    let rectY = mouseY - rectHeight - 20; // 调整文本框的垂直位置

    // 如果气泡靠近画布顶部，向下调整文本框位置
    if (rectY < 0) {
      rectY = mouseY + 20;
    }

    rectX = constrain(rectX, 0, width - rectWidth);
    rectY = constrain(rectY, 0, height - rectHeight);
    
    fill(255); // 白色背景
    rect(rectX, rectY, rectWidth, rectHeight);

    fill(0); // 黑色文本
    textAlign(CENTER, CENTER);
    text(textString, mouseX, rectY + rectHeight / 2); // 调整文本的垂直位置
  }
}




function drawAxes() {
  // 绘制坐标轴
  stroke(0);
  line(100, 50, 100, height - 50); // Y轴
  line(100, height - 50, width - 100, height - 50); // X轴

  // 添加刻度线和坐标轴标签
  drawAxisLabels();
  drawAxisTicks();
}

function drawAxisLabels() {
  // 绘制坐标轴标签
  textAlign(CENTER, CENTER);
  textSize(12);
  fill(0);
  // X轴标签
  text("(Diameter)", width / 2, height - 20);
  // Y轴标签
  push();
  translate(60, height / 2);
  rotate(-PI / 2);
  text("(Average Height)", 0, 0);
  pop();
}

function drawAxisTicks() {
  // 绘制坐标轴刻度
  textSize(10);
  textAlign(CENTER, CENTER);
  // X轴刻度
  for (let i = 0; i <= 60; i += 10) {
    let x = map(i, 0, 60, 100, width - 100);
    line(x, height - 50, x, height - 45);
    text(i, x, height - 35);
  }
  // Y轴刻度
  for (let i = 0; i <= 80; i += 10) {
    let y = map(i, 0, 80, height - 50, 50);
    line(100, y, 105, y);
    text(i, 85, y);
  }
}
