export default function SectionTitleEle({ children, className = '' }) {
  return (
    <div className={`${className}`}>
      <div className="LT_title flex">
        <hr className="h-[8vh] w-[2vw] lg:w-[0.9vw] lg:h-[3.2vw] bg-gradient-to-b from-[#8F5F1F] via-[#D4A845] to-[#8F5F1F] border-none mr-[2%]" />
        <h4 className="oswald-bold h3 white_color">{children}</h4>
      </div>
    </div>
  );
}
