interface NeonText3DProps {
  text: string;
  size?: string;
  className?: string;
}

export default function NeonText3D({
  text,
  size = "2rem",
  className = "",
}: NeonText3DProps) {
  return (
    <span className={`neon-text-3d ${className}`} style={{ fontSize: size }}>
      {text}
    </span>
  );
}
