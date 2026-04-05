export default function LiveMap() {

  return (

    <div className="w-full h-[400px] rounded-2xl overflow-hidden border">

      <iframe

        title="College Map"

        src="https://maps.google.com/maps?q=Government%20Engineering%20College%20Ajmer&t=k&z=17&ie=UTF8&iwloc=&output=embed"

        className="w-full h-full border-0"

        loading="lazy"

        referrerPolicy="no-referrer-when-downgrade"

      />

    </div>

  );

}