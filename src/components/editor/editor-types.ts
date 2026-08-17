export type EditorViewMode = "visual" | "preview" | "html" | "json";
export type PreviewDevice = "desktop" | "tablet" | "mobile";

export type TypographyState = {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  fontStyle: string;
  letterSpacing: string;
  lineHeight: string;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  textAlign: "left" | "center" | "right" | "justify";
};

export type GlowState = {
  enabled: boolean;
  color: string;
  blur: number; // in px
  spread: number; // in px
  opacity: number; // 0 to 1
  layers: number; // 1 to 3
};

export type StrokeState = {
  enabled: boolean;
  width: number; // in px
  color: string;
  style: "solid" | "dashed" | "dotted";
};

export type ShadowState = {
  enabled: boolean;
  x: number;
  y: number;
  blur: number;
  color: string;
  opacity: number;
};

export type GradientState = {
  enabled: boolean;
  type: "linear" | "radial";
  angle: number; // in deg
  from: string;
  to: string;
  via?: string;
};

export type BackgroundState = {
  color: string;
  gradient?: GradientState;
  glass: boolean;
  glassBlur: number;
  glassOpacity: number;
  padding: string;
  borderRadius: string;
};

export type BorderSide = {
  width: number;
  style: "solid" | "dashed" | "dotted" | "double" | "groove" | "ridge" | "inset" | "outset" | "none";
  color: string;
};

export type BorderState = {
  unified: boolean;
  all: BorderSide;
  top: BorderSide;
  right: BorderSide;
  bottom: BorderSide;
  left: BorderSide;
  radius: number; // in px
};

export type SpacingState = {
  marginTop: string;
  marginBottom: string;
  marginLeft: string;
  marginRight: string;
  paddingTop: string;
  paddingBottom: string;
  paddingLeft: string;
  paddingRight: string;
};

export type AnimationState = {
  type: "none" | "fade" | "slide" | "zoom" | "pulse" | "glow" | "bounce";
  duration: number; // in seconds
  delay: number; // in seconds
  infinite: boolean;
};

export type SelectionFormatState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  subscript: boolean;
  superscript: boolean;
  code: boolean;
  fontFamily: string;
  fontSize: string;
  color: string;
  backgroundColor: string;
  glow: GlowState;
  stroke: StrokeState;
  shadow: ShadowState;
  gradient: GradientState;
  alignment: "left" | "center" | "right" | "justify";
  bulletList: boolean;
  numberedList: boolean;
};

export type ElementInspectorData = {
  tag: string;
  text: string;
  title?: string;
  code?: string;
  icon?: string;
  status?: string;
  penalty?: string;
  typography: TypographyState;
  glow: GlowState;
  stroke: StrokeState;
  shadow: ShadowState;
  background: BackgroundState;
  border: BorderState;
  spacing: SpacingState;
  animation: AnimationState;
  attributes: Record<string, string>;
};

export type SavedComponentPreset = {
  id: string;
  name: string;
  category: string;
  icon: string;
  html: string;
  styles?: Record<string, string>;
  createdAt: number;
};
