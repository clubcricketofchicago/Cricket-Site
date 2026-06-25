export default function SectionTitleEle({ children, className = '' }) {
  return (
    <div className={`${className}`}>
      <div className="LT_title flex">
        <hr className="h-[8vh] w-[2vw] lg:w-[0.9vw] lg:h-[3.2vw] bg-[var(--orange)] border-none mr-[2%]" />
        <h4 className="oswald-bold h3 text-[color:var(--text)]">{children}</h4>
      </div>
    </div>
  );
}
