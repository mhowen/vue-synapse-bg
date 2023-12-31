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

// user color is parsed into this; ultimately interpolated into rgb(r g b / a) for rendering
type ColorCoords = [number, number, number];

type SynapseBgOptions = {
  color?: string;       
  networkSize?: number;
  speedScale?: number;
  tracerScale?: number; 
  viewport?: boolean;   // if present, parent container dimensions are ignored and canvases fill viewport
}

export default class SynapseBg {
  rootContainer: HTMLDivElement; // element wrapping the two canvases (layers)
  networkLayer: SynapseBgLayer;  // Layer onto which network is drawn
  signalLayer: SynapseBgLayer;   // Layer onto which Signals and Tracers are drawn
  intervalId: number;            // used to start and stop animation loops
  networkSize: number;           // number of interconnected nodes generated per network
  speedScale: number;            // multiplies base speed of Signals
  tracerScale: number;           // width of each Tracer in coordinate space units
  colorCoords: ColorCoords;      // base color before changes to opacity are taken into account
  options: SynapseBgOptions;
  static allowedColorSpaces = [sRGB, HSL, HWB, Lab, LCH, OKLab, OKLCH];
  static cycleInterval = 20; // in ms
  static defaultNetworkSize = 5; // number of Nodes in network

  // userColor can be any CSS Color 4 keyword or <color> string in the allowed ColorSpaces
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
    this.speedScale = options.speedScale || 1;
    this.tracerScale = options.tracerScale || 1;
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
      this.speedScale,
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
