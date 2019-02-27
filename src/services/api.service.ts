import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { api_baseUrl, api_sharedInventory, api_bank, api_weeklyBosses } from '../const.js';
import { forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) { }

  private apiKeys = {
    "Ara": [
      {
        "name": "HUNGER.2179",
        "api_key": "42671A65-56C0-F047-BEEE-145670F45AD338EEBECA-A802-4EDB-94C7-8EB0367AF4C8"
      },
      {
        "name": "Ara.8970",
        "api_key": "1D1812C1-C7DB-0241-87F7-5C00D51784279A9E3D0F-699F-4A5E-9524-81A332490F7D"
      },
      {
        "name": "Ara.4082",
        "api_key": "29E0090F-B91B-4048-BBF6-2D5E38B14FAA3E6E4B71-3572-416A-A1E2-BA40B4248A7D"
      }
    ]
  };

  getApi = (username: string = 'Ara') => {
    return this.apiKeys[username];
  }

  getStuff = (apikey: string) => {
    let fromBankUrl = api_baseUrl + api_bank + '?access_token=' + apikey;
    let fromSharedInventoryUrl = api_baseUrl + api_sharedInventory + '?access_token=' + apikey;
    let fromBank = this.http.get(fromBankUrl);
    let fromSharedInventory = this.http.get(fromSharedInventoryUrl);
    return forkJoin([fromBank, fromSharedInventory]);
  }

  getBossKilled = (apikey: string) => {
    let killedThisWeekUrl = api_baseUrl + api_weeklyBosses + '?access_token=' + apikey;
    return this.http.get(killedThisWeekUrl);
  }

  getLegendaryDivinations = (apikey: string) => {

  }
}