import http from 'k6/http';
import { check } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";


export const options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'constant-arrival-rate',

      duration: '30s',
      rate: 2,   
      timeUnit: '1s',
      preAllocatedVUs: 50,

    },
  },
};



export default function () {


    const soapReqBody = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:hs="http://www.holidaywebservice.com/HolidayService_v2/">
    <soapenv:Body>
        <hs:GetHolidaysAvailable>
            <hs:countryCode>UnitedStates</hs:countryCode>
        </hs:GetHolidaysAvailable>
    </soapenv:Body>
</soapenv:Envelope>`

    const res = http.post('http://www.holidaywebservice.com/HolidayService_v2/HolidayService2.asmx',
      soapReqBody,
      { headers: { 'Content-Type': 'text/xml' } }
    );

    check(res, {
        'status code 200': (r) => r.status === 200
    });
}

export function handleSummary(data) {
  return {
    "index.html": htmlReport(data),
  };
}