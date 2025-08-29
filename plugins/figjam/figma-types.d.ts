// Basic Figma Plugin API types
declare const figma: any;
declare const __html__: string;

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface SceneNode {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface StickyNode extends SceneNode {
  text: { characters: string };
  resize(width: number, height: number): void;
  fills: any[];
}

interface TextNode extends SceneNode {
  characters: string;
  fontSize: number;
  fontName: any;
  fills: any[];
  textAutoResize: string;
  textAlignHorizontal: string;
  textAlignVertical: string;
}

interface RectangleNode extends SceneNode {
  resize(width: number, height: number): void;
  fills: any[];
  strokes: any[];
  strokeWeight: number;
}