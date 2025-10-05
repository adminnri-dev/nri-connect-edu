import logo from "@/assets/nri-logo.png";

interface LogoWatermarkProps {
  opacity?: number;
  size?: string;
}

export function LogoWatermark({ opacity = 0.05, size = "500px" }: LogoWatermarkProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
      <img 
        src={logo} 
        alt="" 
        style={{ 
          width: size, 
          height: size, 
          opacity: opacity 
        }}
        className="object-contain"
      />
    </div>
  );
}