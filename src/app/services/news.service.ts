import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { NewsResponse, Article, ArticlesByCategoryAndPage } from '../interfaces';
import { Observable, of } from 'rxjs';
import { map } from "rxjs/operators";
import { storedArticlesByCategory } from '../data/mock-news';

const apiKey = environment.apiKey;
const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  //private articlesByCategoryAndPage: ArticlesByCategoryAndPage = {}
  private articlesByCategoryAndPage: ArticlesByCategoryAndPage = storedArticlesByCategory;

  constructor( private http: HttpClient) { }

  private executeQuery<T>(endpoint: string){
    console.log('Peticion HTTP realizada');
    return this.http.get<T>(`${apiUrl}${endpoint}`,{
      params:{
        apiKey: apiKey,
        country:'us',
      }
    })
  }

  getTopHeadLines(): Observable<Article[]>{
    // return this.executeQuery<NewsResponse>(`/top-headlines?category=business`)
    //   .pipe(
    //     map(({articles}) => articles)
    //   )

    return this.getTopHeadLinesByCategory('business');
  }

  getTopHeadLinesByCategory(category: string, loadMore: boolean=false):Observable<Article[]>{

    //Con esta linea no ireamos a buscar a la app los datos.
    return of(this.articlesByCategoryAndPage[category].articles);

    if(loadMore){
      return this.getArticlesByCategory(category);
    }

    if(this.articlesByCategoryAndPage[category]){
      return of(this.articlesByCategoryAndPage[category].articles);
    }

    return this.getArticlesByCategory(category);
  }

  private getArticlesByCategory(category: string):Observable<Article[]>{
    if(Object.keys(this.articlesByCategoryAndPage).includes(category)){
      //Ya existe
      //this.articlesByCategoryAndPage[category].page += 1;
    }else{
      //No existe
      this.articlesByCategoryAndPage[category] = {
        page:0,
        articles: []
      }
    }

    const page = this.articlesByCategoryAndPage[category].page + 1;

    return this.executeQuery<NewsResponse>(`/top-headlines?category=${category}&page=${page}`)
      .pipe(
        map(({articles}) => {
          if(articles.length === 0) return this.articlesByCategoryAndPage[category].articles;

          this.articlesByCategoryAndPage[category] = {
            page: page,
            articles: [...this.articlesByCategoryAndPage[category].articles, ...articles]
          }

          return this.articlesByCategoryAndPage[category].articles;
        })
      )
  }

}
