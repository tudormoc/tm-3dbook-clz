import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';

const COVER_THICKNESS = 0.05; // Thickness of the cardboard cover itself
const PAGE_OFFSET = 0.02; // Indentation of pages from cover edge (THE SQUARES - UNGHIE)

export function Book({
    imageUrl,
    width = 3,
    height = 4.5,
    spineWidth = 0.6,
    realWidth,
    realHeight,
    realSpine,
    openRatio = 0, // 0 to 1
    showPages = true,
    bindingType = 'swiss', // 'swiss' or 'classic'
    coverColor = '#ffffff'
}) {
    const group = useRef();
    const frontRef = useRef();
    const backRef = useRef();
    const spineRef = useRef();

    // Load texture if url is present
    const texture = useTexture(imageUrl || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=');

    const [frontTex, spineTex, backTex] = useMemo(() => {
        if (!texture) return [null, null, null];

        texture.colorSpace = THREE.SRGBColorSpace;

        const front = texture.clone();
        const spine = texture.clone();
        const back = texture.clone();

        return [front, spine, back];
    }, [texture]);

    // Update Texture UVs based on dimensions
    useEffect(() => {
        if (!frontTex || !spineTex || !backTex) return;

        const totalWidth = width * 2 + spineWidth;

        // Back (Right side of image in this inverted logic)
        backTex.offset.x = (width + spineWidth) / totalWidth;
        backTex.repeat.x = width / totalWidth;

        // Spine (Middle)
        spineTex.offset.x = width / totalWidth;
        spineTex.repeat.x = spineWidth / totalWidth;

        // Front (Left side of image in this inverted logic)
        frontTex.offset.x = 0;
        frontTex.repeat.x = width / totalWidth;

        // frontTex.needsUpdate = true;
        // spineTex.needsUpdate = true;
        // backTex.needsUpdate = true;
    }, [frontTex, spineTex, backTex, width, spineWidth]);

    // Animation state
    useFrame((state, delta) => {
        if (!frontRef.current || !backRef.current) return;

        const closedAngleFront = -Math.PI / 2;
        const closedAngleBack = Math.PI / 2;
        const openAngle = 0;

        // Interpolate based on openRatio
        const targetFront = THREE.MathUtils.lerp(closedAngleFront, openAngle, openRatio);
        const targetBack = THREE.MathUtils.lerp(closedAngleBack, openAngle, openRatio);

        const speed = 5 * delta; // Slightly faster response
        frontRef.current.rotation.y = THREE.MathUtils.lerp(frontRef.current.rotation.y, targetFront, speed);
        backRef.current.rotation.y = THREE.MathUtils.lerp(backRef.current.rotation.y, targetBack, speed);
    });

    // Materials
    // 0: Right, 1: Left, 2: Top, 3: Bottom, 4: Front, 5: Back
    const pageBlockMaterial = useMemo(() => {
        const paperWhite = new THREE.MeshStandardMaterial({ color: "#fdfdfd", roughness: 0.9 });
        const paperEdge = new THREE.MeshStandardMaterial({ color: "#f0f0f0", roughness: 0.9 }); // Slightly darker for edges
        return [
            paperEdge, // Right (Fore-edge)
            paperWhite, // Left (Spine-side, hidden mostly)
            paperEdge, // Top
            paperEdge, // Bottom
            paperWhite, // Front (Top face when open)
            paperWhite  // Back (Bottom face against cover)
        ];
    }, []);

    return (
        <group ref={group}>
            {/* Spine (Center Anchor) */}
            <mesh ref={spineRef} position={[0, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[spineWidth, height, COVER_THICKNESS]} />
                <meshStandardMaterial map={imageUrl ? spineTex : null} color={coverColor} roughness={0.4} />
            </mesh>

            {/* Front Cover (Hinged Right of Spine) */}
            <group position={[spineWidth / 2, 0, COVER_THICKNESS / 2]}>
                <group ref={frontRef} rotation={[0, -Math.PI / 2, 0]}>
                    <mesh position={[width / 2, 0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[width, height, COVER_THICKNESS]} />
                        <meshStandardMaterial attach="material-5" map={imageUrl ? frontTex : null} color={coverColor} roughness={0.4} /> {/* Outside cover */}
                        <meshStandardMaterial attach="material-4" color="#eee" /> {/* Inside cover */}
                        <meshStandardMaterial attach="material-0" color="#eee" />
                        <meshStandardMaterial attach="material-1" color="#eee" />
                        <meshStandardMaterial attach="material-2" color="#eee" />
                        <meshStandardMaterial attach="material-3" color="#eee" />
                        {/* Labels removed as per user request */}
                    </mesh>

                    {/* Pages Block (Front Side) */}
                    {showPages && (
                        bindingType === 'swiss' ? (
                            <mesh
                                position={[
                                    width / 2 - PAGE_OFFSET,
                                    0,
                                    COVER_THICKNESS + (Math.max(0.01, spineWidth - COVER_THICKNESS * 2) / 2)
                                ]}
                                castShadow
                                material={pageBlockMaterial}
                            >
                                <boxGeometry args={[
                                    width - PAGE_OFFSET * 2,
                                    height - PAGE_OFFSET * 2,
                                    Math.max(0.01, spineWidth - COVER_THICKNESS * 2)
                                ]} />
                            </mesh>
                        ) : (
                            <mesh
                                position={[
                                    (width - PAGE_OFFSET * 2) / 2,
                                    0,
                                    COVER_THICKNESS + (Math.max(0.01, spineWidth - COVER_THICKNESS * 2) / 2)
                                ]}
                                castShadow
                                material={pageBlockMaterial}
                            >
                                <boxGeometry args={[
                                    width - PAGE_OFFSET * 2,
                                    height - PAGE_OFFSET * 2,
                                    Math.max(0.01, spineWidth - COVER_THICKNESS * 2)
                                ]} />
                            </mesh>
                        )
                    )}
                </group>
            </group>

            {/* Back Cover (Hinged Left of Spine) */}
            <group position={[-spineWidth / 2, 0, COVER_THICKNESS / 2]}>
                <group ref={backRef} rotation={[0, -Math.PI / 2, 0]}>
                    <mesh position={[-width / 2, 0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[width, height, COVER_THICKNESS]} />
                        <meshStandardMaterial attach="material-5" map={imageUrl ? backTex : null} color={coverColor} roughness={0.4} /> {/* Back face is outside */}
                        <meshStandardMaterial attach="material-4" color="#eee" /> {/* Inside cover */}
                        <meshStandardMaterial attach="material-0" color="#eee" />
                        <meshStandardMaterial attach="material-1" color="#eee" />
                        <meshStandardMaterial attach="material-2" color="#eee" />
                        <meshStandardMaterial attach="material-3" color="#eee" />
                        {/* Labels removed as per user request */}
                    </mesh>

                    {/* Pages Block (Back Side) */}
                    {showPages && bindingType === 'classic' && (
                        <mesh
                            position={[
                                -(width - PAGE_OFFSET * 2) / 2,
                                0,
                                COVER_THICKNESS + (Math.max(0.01, spineWidth - COVER_THICKNESS * 2) / 2)
                            ]}
                            castShadow
                            material={pageBlockMaterial}
                        >
                            <boxGeometry args={[
                                width - PAGE_OFFSET * 2,
                                height - PAGE_OFFSET * 2,
                                Math.max(0.01, spineWidth - COVER_THICKNESS * 2)
                            ]} />
                        </mesh>
                    )}
                </group>
            </group>

        </group>
    );
}
