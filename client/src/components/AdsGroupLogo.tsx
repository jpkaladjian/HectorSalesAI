import adsGroupLogo from "@assets/logo_ADS_Group_2025_1760984027908.png";

interface AdsGroupLogoProps {
  className?: string;
  height?: number;
}

export function AdsGroupLogo({ className = "", height = 60 }: AdsGroupLogoProps) {
  return (
    <div className={`inline-block bg-white rounded-lg px-4 py-2 ${className}`}>
      <img 
        src={adsGroupLogo} 
        alt="ADS GROUP - Business Security" 
        style={{ height: `${height}px` }}
      />
    </div>
  );
}
