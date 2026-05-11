"use client";

import React, { useEffect, useRef } from "react";

// ─── Fragment Shader ───────────────────────────────────────────────────────────
const fragmentShaderSource = `#version 300 es
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
uniform vec3 u_color;

#define FC gl_FragCoord.xy
#define R resolution
#define T (time+660.)

float rnd(vec2 p){p=fract(p*vec2(12.9898,78.233));p+=dot(p,p+34.56);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(rnd(i),rnd(i+vec2(1,0)),u.x),mix(rnd(i+vec2(0,1)),rnd(i+1.),u.x),u.y);}
float fbm(vec2 p){float t=.0,a=1.;for(int i=0;i<5;i++){t+=a*noise(p);p*=mat2(1,-1.2,.2,1.2)*2.;a*=.5;}return t;}

void main(){
  vec2 uv=(FC-.5*R)/R.y;
  vec3 col=vec3(.02, .01, .01);
  uv.x+=.25;
  uv*=vec2(2,1);

  float n=fbm(uv*.28-vec2(T*.01,0.));
  n=noise(uv*3.+n*2.);

  col.r-=fbm(uv+vec2(0,T*.015)+n)*.8;
  col.g-=fbm(uv*1.003+vec2(0,T*.015)+n+.003)*.6;
  col.b-=fbm(uv*1.006+vec2(0,T*.015)+n*.006)*.3;

  col=mix(col, u_color, dot(col,vec3(.21,.71,.07))*.8);

  col=mix(vec3(.08),col,min(time*.05,1.));
  col=clamp(col,.02,1.);
  O=vec4(col,1);
}`;

// ─── Vertex Shader (string normal, SEM template literal dentro de classe) ─────
const vertexShaderSource = "#version 300 es\\nprecision highp float;\\nin vec4 position;\\nvoid main(){gl_Position=position;}"; 

const fragmentShaderSource = `#version 300 es
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
uniform vec3 u_color;

#define FC gl_FragCoord.xy
#define R resolution
#define T (time+660.)

float rnd(vec2 p){p=fract(p*vec2(12.9898,78.233));p+=dot(p,p+34.56);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(rnd(i),rnd(i+vec2(1,0)),u.x),mix(rnd(i+vec2(0,1)),rnd(i+1.),u.x),u.y);}
float fbm(vec2 p){float t=.0,a=1.;for(int i=0;i<5;i++){t+=a*noise(p);p*=mat2(1,-1.2,.2,1.2)*2.;a*=.5;}return t;}

void main(){
  vec2 uv=(FC-.5*R)/R.y;
  vec3 col=vec3(.02,.01,.01);
  uv.x+=.25;
  uv*=vec2(2,1);

  float n=fbm(uv*.28-vec2(T*.01,0.));
  n=noise(uv*3.+n*2.);

  col.r-=fbm(uv+vec2(0.,T*.015)+n)*.8;
  col.g-=fbm(uv*1.003+vec2(0.,T*.015)+n+.003)*.6;
  col.b-=fbm(uv*1.006+vec2(0.,T*.015)+n*.006)*.3;

  col=mix(col,u_color,dot(col,vec3(.21,.71,.07))*.8);
  col=mix(vec3(.08),col,min(time*.05,1.));
  col=clamp(col,.02,1.);
  O=vec4(col,1);
}`;

interface CinemaSmokeProps {
  smokeColor?: string;
}

// ─── Hex → RGB float ──────────────────────────────────────────────────────────
const hexToRgb = (hex: string): [number, number, number] | null => {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    : null;
};

// ─── Renderer ─────────────────────────────────────────────────────────────────
class Renderer {
  private readonly vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

  private gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;
  private program: WebGLProgram | null = null;
  private vs: WebGLShader | null = null;
  private fs: WebGLShader | null = null;
  private buffer: WebGLBuffer | null = null;
  private color: [number, number, number] = [0.94, 0.35, 0.05];

  constructor(canvas: HTMLCanvasElement, fragmentSource: string) {
    this.canvas = canvas;
    const ctx = canvas.getContext("webgl2");
    if (!ctx) throw new Error("WebGL2 não suportado");
    this.gl = ctx;
    this.setup(fragmentSource);
    this.init();
  }

  updateColor(newColor: [number, number, number]) {
    this.color = newColor;
  }

  updateScale() {
    const dpr = Math.max(1, window.devicePixelRatio);
    const { innerWidth: width, innerHeight: height } = window;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  private compile(shader: WebGLShader, source: string) {
    const gl = this.gl;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader error:", gl.getShaderInfoLog(shader));
    }
  }

  reset() {
    const { gl, program, vs, fs } = this;
    if (!program) return;
    if (vs) { gl.detachShader(program, vs); gl.deleteShader(vs); }
    if (fs) { gl.detachShader(program, fs); gl.deleteShader(fs); }
    gl.deleteProgram(program);
    this.program = null;
  }

  private setup(fragmentSource: string) {
    const gl = this.gl;
    const vs = gl.createShader(gl.VERTEX_SHADER);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;

    this.vs = vs;
    this.fs = fs;
    this.program = program;

    this.compile(vs, vertexShaderSource);
    this.compile(fs, fragmentSource);

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
    }
  }

  private init() {
    const { gl, program } = this;
    if (!program) return;

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    // Armazena locations como propriedades extras
    (program as any)._resolution = gl.getUniformLocation(program, "resolution");
    (program as any)._time = gl.getUniformLocation(program, "time");
    (program as any)._u_color = gl.getUniformLocation(program, "u_color");
  }

  render(now = 0) {
    const { gl, program, buffer, canvas } = this;
    if (!program || !gl.isProgram(program)) return;

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.uniform2f((program as any)._resolution, canvas.width, canvas.height);
    gl.uniform1f((program as any)._time, now * 1e-3);
    gl.uniform3fv((program as any)._u_color, this.color);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

export const CinemaSmoke: React.FC<CinemaSmokeProps> = ({
  smokeColor = "#ea580c",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);

  // Init WebGL
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer(canvas, fragmentShaderSource);
    } catch (e) {
      console.warn("CinemaSmoke: WebGL2 não disponível.", e);
      return;
    }
    rendererRef.current = renderer;

    const handleResize = () => renderer.updateScale();
    handleResize();
    window.addEventListener("resize", handleResize);

    let raf: number;
    const loop = (now: number) => {
      renderer.render(now);
      raf = requestAnimationFrame(loop);
    };
    loop(0);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(raf);
      renderer.reset();
    };
  }, []);

  // Atualiza cor quando prop muda
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    const rgb = hexToRgb(smokeColor);
    if (rgb) renderer.updateColor(rgb);
  }, [smokeColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: -10,
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
};

export default CinemaSmoke;

