import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const TrackingCodeSettings: React.FC = () => {
    const { authenticatedUser } = useAuth();
    const [hasCopied, setHasCopied] = useState(false);
    
    const orgId = authenticatedUser?.organizationId;

    const trackingCode = `<!-- VersaCRM Tracking Code -->
<script>
(function(v,e,r,s,a){
  v['VersaCRM']=a;v[a]=v[a]||function(){(v[a].q=v[a].q||[]).push(arguments)};
  var f=e.getElementsByTagName(r)[0];var j=e.createElement(r);
  j.async=true;j.src=s;f.parentNode.insertBefore(j,f);
})(window,document,'script','https://cdn.versacrm.com/tracker.js','vtrack');

vtrack('init', '${orgId}');
vtrack('pageview');
</script>
<!-- End VersaCRM Tracking Code -->`;

    const handleCopy = () => {
        navigator.clipboard.writeText(trackingCode);
        setHasCopied(true);
        toast.success("Tracking code copied to clipboard!");
        setTimeout(() => setHasCopied(false), 2000);
    };

    return (
        <div>
            <h3 className="text-lg font-semibold">Website Tracking Code</h3>
            <p className="text-sm text-text-secondary mb-4">
                Install this code on every page of your website to track visitor activity and link it to contacts when they submit a form.
                Place it just before the closing <code>&lt;/body&gt;</code> tag.
            </p>
            <div className="relative p-3 bg-gray-800 text-white rounded-lg font-mono text-sm">
                <pre><code>{trackingCode}</code></pre>
                <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-700 hover:bg-gray-600"
                    aria-label="Copy code"
                >
                    {hasCopied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                </button>
            </div>
        </div>
    );
};

export default TrackingCodeSettings;