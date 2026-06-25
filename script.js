const steps = [
  {
    title: "光反应启动",
    text: "光能进入类囊体薄膜，启动光反应。",
    task: "从光反应开始，点亮第 1 个节点：光反应。",
    success: "光反应启动：光能被类囊体薄膜捕获，后续水的光解和能量转化开始。"
  },
  {
    title: "水的光解",
    text: "H2O 在光反应中被分解，产生 O2、H+ 和 e-。",
    task: "继续点亮第 2 个节点：水的光解。",
    success: "水的光解完成：O2 释放出去，H+ 和 e- 留在光反应中继续参与 NADPH 的形成。"
  },
  {
    title: "ATP 的形成",
    text: "光反应把能量用于 ADP + Pi 合成 ATP。",
    task: "继续点亮第 3 个节点：ATP 形成。",
    success: "ATP 形成：ADP + Pi 接收能量形成 ATP，为暗反应提供直接能量。"
  },
  {
    title: "NADPH 的形成",
    text: "NADP+ 接收 H+ 和 e-，形成 NADPH。",
    task: "继续点亮第 4 个节点：NADPH 形成。",
    success: "NADPH 形成：NADPH 携带氢和还原力，后面用于 C3 的还原。"
  },
  {
    title: "CO2 的固定",
    text: "暗反应在叶绿体基质中进行，CO2 与 C5 结合生成 2C3。",
    task: "继续点亮第 5 个节点：CO2 固定。",
    success: "CO2 固定完成：CO2 + C5 生成 2C3，碳进入卡尔文循环。"
  },
  {
    title: "C3 的还原",
    text: "C3 利用 ATP 和 NADPH 被还原，形成糖类，同时再生 C5。",
    task: "继续点亮第 6 个节点：C3 还原。",
    success: "C3 还原完成：ATP 供能，NADPH 供氢和还原力，生成糖类并再生 C5。"
  },
  {
    title: "物质返回光反应",
    text: "暗反应消耗 ATP 和 NADPH 后，产生 ADP + Pi 和 NADP+，它们返回光反应继续循环。",
    task: "点亮最后一个节点：NADP+ 和 ADP + Pi 返回光反应。",
    success: "返回完成：NADP+、ADP + Pi 回到光反应，下一轮光能转换可以继续。"
  }
];

const app = document.querySelector(".app");
const stepIndex = document.querySelector("#stepIndex");
const stepTitle = document.querySelector("#stepTitle");
const stepText = document.querySelector("#stepText");
const taskText = document.querySelector("#taskText");
const feedbackText = document.querySelector("#feedbackText");
const demoButton = document.querySelector("#playStep");
const prevButton = document.querySelector("#prevStep");
const nextButton = document.querySelector("#nextStep");
const trackItems = Array.from(document.querySelectorAll(".step-track span"));
const nodes = Array.from(document.querySelectorAll(".hotspot"));

let currentStep = 0;
let demoTimer = null;
let advanceTimer = null;
const completed = new Set();

function render() {
  const step = steps[currentStep];
  app.dataset.step = String(currentStep);
  app.dataset.complete = completed.has(currentStep) ? "true" : "false";

  stepIndex.textContent = `第 ${currentStep + 1} 步 / ${steps.length}`;
  stepTitle.textContent = step.title;
  stepText.textContent = step.text;
  taskText.textContent = step.task;
  feedbackText.textContent = completed.has(currentStep) ? step.success : "按模型中的编号顺序点亮节点。点亮后进入下一步。";
  feedbackText.classList.toggle("is-success", completed.has(currentStep));

  nextButton.disabled = !completed.has(currentStep);
  nextButton.setAttribute("aria-disabled", String(nextButton.disabled));

  trackItems.forEach((item, index) => {
    item.classList.toggle("active", index <= currentStep);
    item.classList.toggle("complete", completed.has(index));
  });

  nodes.forEach((node) => {
    const index = Number(node.dataset.hotspot);
    node.classList.toggle("is-current", index === currentStep && !completed.has(index));
    node.classList.toggle("is-complete", completed.has(index));
    node.classList.toggle("is-locked", index > currentStep);
    node.disabled = false;
    node.setAttribute("aria-current", index === currentStep ? "step" : "false");
  });
}

function completeStep(index) {
  completed.add(index);
  stopDemo();
  render();
  window.clearTimeout(advanceTimer);
  if (index < steps.length - 1) {
    advanceTimer = window.setTimeout(() => {
      if (currentStep === index) {
        currentStep += 1;
        render();
      }
    }, 900);
  }
}

function handleNodeClick(index) {
  if (index === currentStep) {
    completeStep(index);
    return;
  }

  if (completed.has(index)) {
    feedbackText.textContent = "这个节点已经点亮了。继续寻找当前发光的下一步。";
  } else if (index > currentStep) {
    feedbackText.textContent = `顺序还没到这里。请先点亮第 ${currentStep + 1} 个节点。`;
  } else {
    feedbackText.textContent = "前面的步骤已经完成，继续看当前发光节点。";
  }
  feedbackText.classList.remove("is-success");
  app.classList.add("needs-click");
  window.setTimeout(() => app.classList.remove("needs-click"), 420);
}

function goNext() {
  window.clearTimeout(advanceTimer);
  if (!completed.has(currentStep)) {
    feedbackText.textContent = `先点亮第 ${currentStep + 1} 个模型节点，再进入下一步。`;
    feedbackText.classList.remove("is-success");
    app.classList.add("needs-click");
    window.setTimeout(() => app.classList.remove("needs-click"), 420);
    return;
  }
  currentStep = Math.min(currentStep + 1, steps.length - 1);
  render();
}

function goPrev() {
  window.clearTimeout(advanceTimer);
  currentStep = Math.max(currentStep - 1, 0);
  stopDemo();
  render();
}

function demoAdvance() {
  completed.add(currentStep);
  if (currentStep < steps.length - 1) {
    currentStep += 1;
    render();
    return;
  }
  stopDemo();
  render();
}

function startDemo() {
  demoButton.textContent = "停止";
  demoTimer = window.setInterval(demoAdvance, 1800);
  demoAdvance();
}

function stopDemo() {
  window.clearTimeout(advanceTimer);
  if (demoTimer) {
    window.clearInterval(demoTimer);
    demoTimer = null;
  }
  demoButton.textContent = "演示";
}

nodes.forEach((node) => {
  node.addEventListener("click", () => handleNodeClick(Number(node.dataset.hotspot)));
});

nextButton.addEventListener("click", goNext);
prevButton.addEventListener("click", goPrev);
demoButton.addEventListener("click", () => {
  if (demoTimer) {
    stopDemo();
    render();
  } else {
    startDemo();
  }
});

render();
