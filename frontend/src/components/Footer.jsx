 import React from "react";

const Footer = () => {
  return (
<>
{/* Footer*/}
<footer className="border-t border-white/5 bg-background-dark py-12 px-4 lg:px-20 text-center">
<div className="flex flex-col items-center gap-6">
<div className="flex items-center gap-2 opacity-50">
<span className="material-symbols-outlined">gavel</span>
<p className="text-sm font-medium">Football Auction System v1.0.0</p>
</div>

<p className="text-slate-600 text-xs">© 2026 Football Auction Engine. All rights reserved.</p>
</div>
</footer>
</>
  );
};

export default Footer;