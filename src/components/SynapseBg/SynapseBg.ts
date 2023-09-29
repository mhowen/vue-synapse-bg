import SynapseBgLayer from "./SynapseBgLayer";
import SynapseBgNode from "./SynapseBgNode";
import SynapseBgSignal from "./SynapseBgSignal";
import {
  ColorSpace,
  HSL,
  HWB,
  sRGB,
  Lab,
  LCH,
  OKLab,
  OKLCH,
  to as convertToGamut,
  parse as parseColor
} from "colorjs.io/fn";

type ColorCoords = [number, number, number];

type SynapseBgOptions = {
  color?: string;
  networkSize?: number;
  tracerScale?: number;
  viewport?: boolean;
}

export default class SynapseBg {
  rootContainer: HTMLDivElement;
  networkLayer: SynapseBgLayer;
  signalLayer: SynapseBgLayer;
  intervalId: number;
  networkSize: number;
  tracerScale: number;
  colorCoords: ColorCoords;
  options: SynapseBgOptions;
  static allowedColorSpaces = [sRGB, HSL, HWB, Lab, LCH, OKLab, OKLCH];
  static cycleInterval = 20; // in ms
  static defaultNetworkSize = 5; // number of Nodes in network
  static defaultTracerScale = 1; // in coordinate space units

  static getColor(userColor: string): ColorCoords {
    try {
      const reg = ColorSpace.registry;
      SynapseBg.allowedColorSpaces.forEach(cs => {
        if (!(cs.id in reg)) ColorSpace.register(cs);
      });

      const parsed = parseColor(userColor);

      return parsed.spaceId === 'srgb' ? parsed.coords : convertToGamut(parsed, 'srgb').coords;
    } catch {
      console.warn(`synapse-bg couldn't parse '${userColor}' as CSS <color> -- setting fallback color`);
      return [0, 0, 0];
    }
  }

  constructor(
    rootContainer: HTMLDivElement,
    networkCanvas: HTMLCanvasElement,
    signalCanvas: HTMLCanvasElement,
    options: SynapseBgOptions
  ) {
    this.rootContainer = rootContainer;
    this.networkLayer = new SynapseBgLayer(networkCanvas);
    this.signalLayer = new SynapseBgLayer(signalCanvas);
    this.intervalId = -1;
    this.options = options;
    this.networkSize = options.networkSize || SynapseBg.defaultNetworkSize;
    this.tracerScale = options.tracerScale || SynapseBg.defaultTracerScale;
    this.colorCoords = options.color ? SynapseBg.getColor(options.color) : [0, 0, 0];

    const parentObserver = new ResizeObserver(entries => entries.forEach(() => this.resize()));

    this.options.viewport
      ? window.addEventListener('resize', () => this.resize())
      : parentObserver.observe(this.parentContainer || document.body);

    this.init();
  }

  get parentContainer(): HTMLElement | null {
    return this.rootContainer.parentElement
  }

  createNetwork(): void {
    const nodes: Array<SynapseBgNode> = [new SynapseBgNode(null, this.colorCoords)];

    for (let i = 1; i < this.networkSize; i++) {
      nodes.unshift(new SynapseBgNode(nodes[0], this.colorCoords));
    }

    this.networkLayer.setEntities(nodes);
  }

  createSignal(): void {
    const sig = new SynapseBgSignal(
      this.networkLayer.entities,
      this.colorCoords,
      1,
      this.tracerScale
    );
    this.signalLayer.addEntity(sig);
  }

  cycle(): void {
    this.signalLayer.entities.some(t => t.isActive) ? this.signalLayer.cycleAll() : this.reset();
  }

  init(): void {
    this.resize();
    this.createNetwork();
    this.createSignal();
    this.networkLayer.doFade(true).then(() => this.start());
  }

  resize(): void {
    const { top, width, height } = !this.options.viewport && this.parentContainer
      ? this.parentContainer.getBoundingClientRect()
      : { top: 0, width: window.innerWidth, height: window.innerHeight };
    this.rootContainer.style.top = `${Math.floor(top)}px`;
    this.rootContainer.style.width = `${Math.floor(width)}px`;
    this.rootContainer.style.height = `${Math.floor(height)}px`;

    [this.networkLayer, this.signalLayer].forEach(l => {
      l.canvas.width = width;
      l.canvas.height = height;
      l.renderAll();
    });
  }

  start(): void {
    clearInterval(this.intervalId);
    this.intervalId = window.setInterval(() => this.cycle(), SynapseBg.cycleInterval);
  }

  reset(): void {
    clearInterval(this.intervalId)
    this.networkLayer.doFade().then(() => this.init());
  }
}
