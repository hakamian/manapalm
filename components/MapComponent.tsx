import React from 'react';

const MapComponent: React.FC = () => {
    // This URL embeds a Google Map centered on Dashtestan County, Bushehr Province, Iran.
    const mapSrc = "https://maps.google.com/maps?q=Dashtestan%20County,Bushehr%20Province,Iran&t=&z=10&ie=UTF8&iwloc=&output=embed";

    return (
        <div className="w-full h-96">
            <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={mapSrc}
                title="Location of Nakhlestan Ma'na"
                aria-label="Map showing the location of Nakhlestan Ma'na in Dashtestan County, Bushehr Province, Iran"
            ></iframe>
        </div>
    );
};

export default MapComponent;
