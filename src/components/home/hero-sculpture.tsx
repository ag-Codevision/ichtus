"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { HERO_ICON_CONTOURS } from "./hero-3d-data";
import { RotateCcw, Move3d } from "lucide-react";

/**
 * Escultura Tridimensional 3D Real com Three.js
 * - Geometria de extrusão sólida (ExtrudeGeometry) derivada dos vetores oficiais da Glessios
 * - Material físico de Acrílico Translúcido (MeshPhysicalMaterial com transmissão, IOR 1.491, clearcoat e refração)
 * - Chanfro perimetral polido a laser que captura luzes e reflexos especulares
 * - Sistema de iluminação de estúdio com backlight LED laranja atmosférico
 * - Rotação 3D livre orbital com arrasto do mouse/toque, inércia física, flutuação suave e suporte a 60+ FPS
 */
export function HeroSculpture() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isDraggingState, setIsDraggingState] = useState(false);

  // Referências para animação e física interativa sem acionar re-renders do React
  const animFrameId = useRef<number | null>(null);
  const isDragging = useRef(false);
  const previousPointerPosition = useRef({ x: 0, y: 0 });
  const angularVelocity = useRef({ x: 0, y: 0.003 }); // Leve rotação contínua inicial
  const targetRotation = useRef({ x: 0.1, y: -0.2 });
  const currentRotation = useRef({ x: 0.1, y: -0.2 });
  const mouseInfluence = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  // Objetos Three.js mantidos em refs para ciclo de vida e descarte
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const dynamicPointLightRef = useRef<THREE.PointLight | null>(null);

  // Função para resetar rotação para a posição de destaque frontal
  const handleResetRotation = useCallback(() => {
    targetRotation.current = { x: 0.08, y: -0.15 };
    angularVelocity.current = { x: 0, y: 0.002 };
  }, []);

  useEffect(() => {
    setMounted(true);
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Inicialização da Cena e Câmera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.9);
    cameraRef.current = camera;

    // 2. Renderizador WebGL de Alta Fidelidade com suporte a transmissão e refração
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    rendererRef.current = renderer;

    // 3. Gerador de Ambiente de Estúdio Procedural (PMREM) para reflexos especulares cristalinos
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    // Cria uma mini-cena de estúdio com softboxes para gerar o mapa de reflexo do acrílico
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color("#121316");

    // Softbox superior branca brilhante (catch-light nas quinas chanfradas)
    const topLight = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    topLight.position.set(0, 6, 3);
    topLight.rotation.x = Math.PI / 3;
    envScene.add(topLight);

    // Softbox frontal-lateral de alto brilho para reflexo especular vítreo
    const frontGleam = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    frontGleam.position.set(3, 2, 4);
    frontGleam.rotation.y = -Math.PI / 4;
    envScene.add(frontGleam);

    // Softbox lateral laranja quente (destaque da marca)
    const sideLight = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff650f, side: THREE.DoubleSide })
    );
    sideLight.position.set(-6, 0, 2);
    sideLight.rotation.y = Math.PI / 3;
    envScene.add(sideLight);

    const envMap = pmremGenerator.fromScene(envScene, 0.04).texture;
    scene.environment = envMap;

    // 4. Sistema de Iluminação Direta de Estúdio
    const ambientLight = new THREE.AmbientLight(0xffedd8, 1.4);
    scene.add(ambientLight);

    // Key Light: Luz Direcional principal com alto specular
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    // Fill Light: Luz de preenchimento suave
    const fillLight = new THREE.DirectionalLight(0xffd0b0, 1.8);
    fillLight.position.set(-4, -2, 4);
    scene.add(fillLight);

    // Rim/Back Light LED traseiro forte (Halo de luz laranja que penetra o acrílico, elevado)
    const backHaloLight = new THREE.PointLight(0xff650f, 10.0, 12, 1.4);
    backHaloLight.position.set(0, 0.28, -1.0);
    scene.add(backHaloLight);

    // Luz dinâmica especular que segue a posição do cursor
    const dynamicPointLight = new THREE.PointLight(0xffffff, 2.6, 10);
    dynamicPointLight.position.set(0, 0.28, 3.5);
    scene.add(dynamicPointLight);
    dynamicPointLightRef.current = dynamicPointLight;

    // 5. Criação das Geometrias e Materiais de Acrílico Cristalino
    const modelGroup = new THREE.Group();
    // Escala maior e mais imponente
    modelGroup.scale.set(1.05, 1.05, 1.05);
    modelGroup.position.y = 0.28;
    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);

    // Configuração de Extrusão Sólida com Chanfro Polido para o Corpo dos Peixes
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 1,
      depth: 0.22, // Espessura realista de placa de acrílico maciço cortado a laser
      bevelEnabled: true,
      bevelThickness: 0.045, // Chanfro usinado polido a laser
      bevelSize: 0.035,
      bevelOffset: 0,
      bevelSegments: 5, // Curvatura suave nas arestas para capturar linhas de luz
      curveSegments: 36,
    };

    // Material de Acrílico Fundido Polido (PMMA Físico Realista)
    const acrylicMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#FF7018"),
      emissive: new THREE.Color("#FF4500"),
      emissiveIntensity: 0.12,
      roughness: 0.03, // Altíssimo polimento espelhado
      metalness: 0.0,
      clearcoat: 1.0, // Camada de verniz externa vítrea
      clearcoatRoughness: 0.02,
      transmission: 0.82, // Transmissão de luz de acrílico cristalino translúcido
      ior: 1.491, // Índice de refração exato do acrílico
      thickness: 1.8, // Volume interno de refração
      attenuationColor: new THREE.Color("#FF4D00"),
      attenuationDistance: 0.8,
      specularIntensity: 1.3,
      specularColor: new THREE.Color("#FFFFFF"),
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
    });

    // Material dos Olhos — Gema de acrílico translúcido polido de alto brilho
    const eyeMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#FFAE66"),
      emissive: new THREE.Color("#FF650F"),
      emissiveIntensity: 0.28,
      roughness: 0.02,
      metalness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      transmission: 0.7,
      ior: 1.491,
      thickness: 1.5,
      attenuationColor: new THREE.Color("#FF5500"),
      attenuationDistance: 0.6,
      specularIntensity: 1.5,
      transparent: true,
      opacity: 1.0,
    });

    // Construção das formas a partir dos contornos vetoriais precisos
    const geometriesToDispose: THREE.BufferGeometry[] = [];

    // 1. Corpo principal dos dois peixes
    const bodyContour = HERO_ICON_CONTOURS[0];
    const bodyShape = new THREE.Shape();
    bodyContour.forEach(([x, y], ptIdx) => {
      if (ptIdx === 0) bodyShape.moveTo(x, y);
      else bodyShape.lineTo(x, y);
    });
    bodyShape.closePath();

    const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
    const depth = extrudeSettings.depth ?? 0.22;
    bodyGeometry.translate(0, 0, -depth / 2);
    geometriesToDispose.push(bodyGeometry);

    const bodyMesh = new THREE.Mesh(bodyGeometry, acrylicMaterial);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    modelGroup.add(bodyMesh);

    // 2. Olhos: Modelados como gemas esféricas de acrílico polido (cabochões)
    // Coordenadas centrais calculadas a partir dos vetores originais
    const eyeConfigs = [
      { center: [-1.362, 0.231], radius: 0.14 }, // Olho do peixe maior
      { center: [-0.831, -0.565], radius: 0.10 }, // Olho do peixe filhote
    ];

    eyeConfigs.forEach(({ center, radius }) => {
      const eyeGeo = new THREE.SphereGeometry(radius, 32, 24);
      // Leve achatamento em Z para formar uma lente convexa perfeita alinhada à espessura
      eyeGeo.scale(1, 1, 0.75);
      geometriesToDispose.push(eyeGeo);

      const eyeMesh = new THREE.Mesh(eyeGeo, eyeMaterial);
      eyeMesh.position.set(center[0], center[1], 0);
      eyeMesh.castShadow = true;
      modelGroup.add(eyeMesh);
    });

    // 5. Interação com Mouse / Touch para Rotação 3D Livre e Parallax
    const handlePointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      setIsDraggingState(true);
      setHasInteracted(true);
      previousPointerPosition.current = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      // Atualiza posição da luz dinâmica para brilho que segue o mouse
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const normY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;

      mouseInfluence.current = {
        x: Math.max(-1, Math.min(1, normX)),
        y: Math.max(-1, Math.min(1, normY)),
      };

      if (dynamicPointLightRef.current) {
        dynamicPointLightRef.current.position.x = mouseInfluence.current.x * 2.5;
        dynamicPointLightRef.current.position.y = mouseInfluence.current.y * 2.0;
      }

      if (!isDragging.current) return;

      const deltaX = e.clientX - previousPointerPosition.current.x;
      const deltaY = e.clientY - previousPointerPosition.current.y;

      // Sensibilidade angular
      const sensitivity = 0.007;
      targetRotation.current.y += deltaX * sensitivity;
      targetRotation.current.x += deltaY * sensitivity;

      // Trava inclinação vertical extrema para navegação confortável
      targetRotation.current.x = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, targetRotation.current.x));

      angularVelocity.current = {
        x: deltaY * sensitivity * 0.4,
        y: deltaX * sensitivity * 0.4,
      };

      previousPointerPosition.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      isDragging.current = false;
      setIsDraggingState(false);
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Ignora caso o ponteiro já tenha sido liberado
      }
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    // 6. Resize Observer para manter aspecto perfeito sem distorção
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth === 0 || newHeight === 0) return;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 7. Loop de Renderização Contínua a 60 FPS
    const renderLoop = () => {
      timeRef.current += 0.016;
      const time = timeRef.current;

      if (!isDragging.current) {
        // Aplica velocidade angular residual (inércia)
        targetRotation.current.y += angularVelocity.current.y;
        targetRotation.current.x += angularVelocity.current.x;

        // Amortecimento / atrito suave
        angularVelocity.current.x *= 0.94;
        angularVelocity.current.y *= 0.94;

        // Auto-rotação sutil contínua se quase parada
        if (Math.abs(angularVelocity.current.y) < 0.0015) {
          targetRotation.current.y += 0.002;
        }

        // Flutuação harmônica suave da peça de acrílico no espaço com centro elevado
        const floatY = 0.28 + Math.sin(time * 1.4) * 0.08;
        const floatZ = Math.cos(time * 1.1) * 0.04;
        if (modelGroupRef.current) {
          modelGroupRef.current.position.y = floatY;
          modelGroupRef.current.position.z = floatZ;
        }
      }

      // Interpolação suave (LERP) para rotação orgânica
      const lerpSpeed = isDragging.current ? 0.25 : 0.08;
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * lerpSpeed;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * lerpSpeed;

      // Adiciona leve influência de paralaxe da posição do mouse
      const parallaxX = mouseInfluence.current.y * 0.12;
      const parallaxY = mouseInfluence.current.x * 0.16;

      if (modelGroupRef.current) {
        modelGroupRef.current.rotation.x = currentRotation.current.x + parallaxX;
        modelGroupRef.current.rotation.y = currentRotation.current.y + parallaxY;
      }

      // Efeito de pulso suave no backlight LED
      backHaloLight.intensity = 5.5 + Math.sin(time * 2.0) * 1.2;

      renderer.render(scene, camera);
      animFrameId.current = requestAnimationFrame(renderLoop);
    };

    animFrameId.current = requestAnimationFrame(renderLoop);

    // 8. Limpeza de Recursos na Desmontagem
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      resizeObserver.disconnect();

      canvas.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);

      geometriesToDispose.forEach((geo) => geo.dispose());
      acrylicMaterial.dispose();
      eyeMaterial.dispose();
      envMap.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      suppressHydrationWarning
      className="relative w-full max-w-[620px] h-[400px] sm:h-[490px] lg:h-[540px] mx-auto flex items-center justify-center select-none -mt-4 sm:-mt-8 lg:-mt-14"
    >
      {/* Halo Traseiro Atmosférico (Brilho Laranja LED Quente com centro elevado) */}
      <div
        suppressHydrationWarning
        className="absolute w-[360px] sm:w-[480px] h-[240px] sm:h-[320px] top-[15%] rounded-full bg-gradient-to-tr from-[#FF650F]/35 via-[#FF7A29]/20 to-transparent blur-[110px] pointer-events-none -z-10 animate-pulse-slow"
        aria-hidden="true"
      />

      {/* Canvas Three.js Interativo */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full block touch-none transition-cursor ${
          isDraggingState ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ outline: "none" }}
        aria-label="Ícone 3D Interativo de Acrílico da Glessios — Arraste com o mouse para girar"
        role="img"
      />

      {/* Dica de Interação 3D Flutuante (Some suavemente após interação) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121316]/80 backdrop-blur-md border border-white/10 text-xs text-zinc-300 pointer-events-none transition-all duration-500 shadow-lg ${
          hasInteracted ? "opacity-0 translate-y-2 pointer-events-none" : "opacity-90 translate-y-0"
        }`}
      >
        <Move3d className="w-3.5 h-3.5 text-[#FF650F] animate-pulse" />
        <span className="font-medium tracking-wide">Arraste para girar em 3D</span>
      </div>

      {/* Botão sutil para resetar posição caso o usuário tenha girado bastante */}
      {hasInteracted && (
        <button
          onClick={handleResetRotation}
          title="Centralizar visualização 3D"
          aria-label="Centralizar visualização 3D"
          className="absolute bottom-3 right-3 p-2 rounded-full bg-[#1e2025]/80 hover:bg-[#282b32] text-zinc-400 hover:text-white border border-white/10 transition-all duration-200 shadow-md hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-4 h-4 text-[#FF650F]" />
        </button>
      )}
    </div>
  );
}
