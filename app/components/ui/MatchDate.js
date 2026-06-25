'use client';

export default function MatchDate({ className = '', logoWhite = false, children }) {
  let img_url = "/images/date.svg";

  if (logoWhite === true) {
    img_url = "/images/date_white.svg";
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className="w-4 h-4 mr-2 flex-shrink-0">
        <img src={img_url} alt="Date Icon" className="w-full h-full ccc-meta-ico" />
      </div>
      <div>
        <p className="roboto-condensed-regular p4">{children}</p>
      </div>
    </div>
  );
}
