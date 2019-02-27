import { Component, OnInit } from '@angular/core';
import { kp_li, kp_ld, kp_100cm, sortedBosses, pictureBosses } from '../const.js'
import { ApiService } from '../services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  strUsername: string = 'Ara';
  selectedApi: Array<any> = [];
  allKillProofs = [];
  allBossKilled = [];
  allData = [];
  pictureBosses;
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.showStuff();
    this.pictureBosses = pictureBosses;
  }

  showStuff() {
    this.selectedApi = this.apiService.getApi();
    let myLI, myLD, my100CM;
    console.log('selectedApi', this.selectedApi);
    // todo replace for with map & forkjoin
    let observableKillProofBatch = [];
    let observableBossesKilledBatch = [];
    for (let account of this.selectedApi) {
      observableKillProofBatch.push(this.apiService.getStuff(account.api_key));
      observableBossesKilledBatch.push(this.apiService.getBossKilled(account.api_key));
    }
    console.log('observableKillProofBatch', observableKillProofBatch.length);
    forkJoin(observableKillProofBatch)
      .subscribe((allKillProofs: any[][]) => {
        this.updateKillProof(allKillProofs);
        forkJoin(observableBossesKilledBatch)
          .subscribe((allBossesKilled: any) => {
            this.updateWeeklyKills(allBossesKilled);
            this.splitBosses();
            this.updateUI();
          });
      });
  }

  /**
   * allKillProofs: array of array of KP (per account, per inventory)
   * inventory handled: shared inventory, bank (no character)
   * KP handled: LI, LD, 100CM (no armor, infusion)
   */
  updateKillProof = (allKillProofs: any[][]) => {
    let myLI, myLD, my100CM;
    for (let account of allKillProofs) {
      myLI = myLD = my100CM = 0;
      for (let inventory of account) {
        for (let item of inventory) {
          if (item === null) {
            continue;
          }
          if (item.id === kp_li) {
            myLI += item.count;
          }
          if (item.id === kp_ld) {
            myLD += item.count;
          }
          if (item.id === kp_100cm) {
            my100CM += item.count;
          }
        }
      }
      this.allKillProofs.push({ 'li': myLI, 'ld': myLD, '100cm': my100CM });
    }
    console.log(this.allKillProofs);
  }

  /**
   * List the bosses killed per account
   */
  updateWeeklyKills = (allBossesKilled: String[][]) => {
    // console.log('bossesKilled', allBossesKilled);
    for (let bossesKilled of allBossesKilled) {
      let bossesKilledUI = [];
      for (let boss of sortedBosses) {
        bossesKilledUI.push(bossesKilled.indexOf(boss) >= 0);
      }
      this.allBossKilled.push(bossesKilledUI);
    }
    console.log('bosses', this.allBossKilled);
  }

  /**
   * fuck, i forgot
   */
  splitBosses = () => {
    let newArray = [];
    for (let account of this.allBossKilled) {
      let currentAccount = [];
      currentAccount.push(account.slice(0, 4)); // W1
      currentAccount.push(account.slice(4, 7)); // W2
      currentAccount.push(account.slice(7, 11)); // W3
      currentAccount.push(account.slice(11, 15)); // W4
      currentAccount.push(account.slice(15, 19)); // W5
      currentAccount.push(account.slice(19, 22)); // W6
      newArray.push(currentAccount);
    }
    this.allBossKilled = newArray;
  }

  updateUI = () => {
    this.selectedApi.forEach((account, index) => {
      let currentAccount = {
        'name': account.name,
        'killProofs': this.allKillProofs[index],
        'bossesKilled': this.allBossKilled[index],
      }
      this.allData.push(currentAccount);
    });
    console.log('allData', this.allData);
  }
}