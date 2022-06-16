import { Component, OnInit, Input } from '@angular/core';
import { Article } from '../../interfaces';
import { Platform, ActionSheetController, ActionSheetButton } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';

//Plugin
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
//import { Action } from 'rxjs/internal/scheduler/Action';


@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
})
export class ArticleComponent implements OnInit {

  @Input() article: Article;
  @Input() index: number;

  constructor( 
    private iab: InAppBrowser, 
    private platform: Platform, 
    private actionSheetCtrl: ActionSheetController, 
    private socialSharing: SocialSharing,
    private storageService: StorageService
    ) { }

  ngOnInit() {}

  openArticle(){

    if(this.platform.is('ios')||this.platform.is('android')){
      const browser = this.iab.create(this.article.url);
      browser.show();
      return;
    }    

    window.open(this.article.url,'_blank');

  }

  async onOpenMenu(){

    const articleInFavorite = this.storageService.articleInFavorites(this.article);



    const btns: ActionSheetButton[] = [
      {
        text: articleInFavorite ? 'Remover Favorito' : 'Favorito',
        icon: articleInFavorite ? 'heart' : 'heart-outline',
        handler: () => this.onToggleFavorite()
      },
      {
        text: 'Cancelar',
        icon: 'close-outline',
        role: 'cancel',
        cssClass: 'secondary'
      }
    ];

    const shareBtn: ActionSheetButton = {
      text: 'Compartir',
      icon: 'share-outline',
      handler: ()=>this.onShareArticle()
    };

    if(this.platform.is('capacitor')){
      btns.unshift(shareBtn);
    }    

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: btns
    });

    await actionSheet.present();
  }

  onShareArticle(){

    const {title, source, url} = this.article;

    this.socialSharing.share(
      this.article.title, //title
      this.article.source.name, //source.name
      null,
      this.article.url //url
    );
  }

  onToggleFavorite(){
    this.storageService.saveRemoveArticle(this.article);
  }

}
