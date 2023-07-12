import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
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

const data = new SharedArray('Leitura do json', function(){
    return JSON.parse(open('./dados.json')).documents
});

export default function () {
    const documents = data[Math.floor(Math.random() * data.length)].CPF
    console.log(documents);

    const soapReqBody = `<?xml version="1.0" encoding="UTF-8"?>
    <NS1:Envelope xmlns:NS1="http://www.w3.org/2003/05/soap-envelope">
      <NS1:Header xmlns:NS1="http://www.w3.org/2003/05/soap-envelope">
        <NS2:metadata xmlns:NS2="http://www.technisys.net/cmm/services/metadata/v2.0">
          <serviceId>processCreditProposal</serviceId>
          <serviceVersion>1.0</serviceVersion>
          <customProperties>
            <businessDate/>
            <serviceContext>ORG</serviceContext>
          </customProperties>
          <userId>TECHNISYS01</userId>
          <executingOperatorId>TECHNISYS01</executingOperatorId>
          <terminalId>BPM</terminalId>
          <sessionId>6D3DC486CDDC26915C008E625C546D18</sessionId>
          <institutionId>1111</institutionId>
          <bankId>212</bankId>
          <branchId>1</branchId>
          <originBranchId>1</originBranchId>
          <dependencyId>1</dependencyId>
          <sourceTime>20230525141258757</sourceTime>
          <sourceDate>20230525141258757</sourceDate>
          <businessDate>20230525141258757</businessDate>
          <parityCurrencyId>1</parityCurrencyId>
          <parityQuotationNemotecnic>1</parityQuotationNemotecnic>
          <localCountryId>12</localCountryId>
          <localCurrencyId>1</localCurrencyId>
          <msgTypeId>200</msgTypeId>
          <locale>pt_BR</locale>
          <executingChannel>
            <mnemonic>8</mnemonic>
          </executingChannel>
          <internals>
            <serviceRequestTimestamp>20230525141258757</serviceRequestTimestamp>
          </internals>
          <traceNumber>10014181.73474757</traceNumber>
        </NS2:metadata>
      </NS1:Header>
      <NS1:Body xmlns:NS1="http://www.w3.org/2003/05/soap-envelope">
        <NS3:processCreditProposalRequest xmlns:NS3="http://www.technisys.net/cmm/services/processCreditProposal/rq/v1.0">
          <creditProposal name="creditProposal">
            <creditRequest>
              <proposal>
                <applicants>
                  <applicant>
                    <cpfCnpjApplicant>${documents}</cpfCnpjApplicant>
                    <applicantType>Titular</applicantType>
                    <specialRequestFlag>N</specialRequestFlag>
                  </applicant>
                </applicants>
                <productCategory>Originacao</productCategory>
              </proposal>
              <channel>
                <channelId>8</channelId>
              </channel>
              <actionCreditRqstId>17</actionCreditRqstId>
              <numberCpfCnpj>${documents}</numberCpfCnpj>
              <loginOfficer>CARLOS.COSTA</loginOfficer>
              <requestType>NaoCorrentista</requestType>
              <requesterControl>20230525</requesterControl>
              <sellingChannel>14</sellingChannel>
              <actionSale>14</actionSale>
              <requestedProducts/>
            </creditRequest>
          </creditProposal>
        </NS3:processCreditProposalRequest>
      </NS1:Body>
    </NS1:Envelope>`

    const res = http.post('http://VSCMMHOM:7080/CMM_SERVICES',
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