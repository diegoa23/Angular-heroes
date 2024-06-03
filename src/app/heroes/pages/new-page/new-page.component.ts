import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { switchMap } from 'rxjs';

import { Hero, Publisher } from '../../interfaces/hero.interface';
import { HeroesService } from '../../services/heroes.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
})
export class NewPageComponent implements OnInit{

  public heroForm = new FormGroup({
    id:         new FormControl<string>(''),
    superhero:  new FormControl<string>('', { nonNullable: true }),
    publisher:  new FormControl<Publisher>(Publisher.DCComics),
    alter_ego:  new FormControl(''),
    first_appearance: new FormControl(''),
    characters: new FormControl(''),
    alt_img:    new FormControl(''),
  })

  public publishers = [
    {id: 'DC Comics', desc: 'DC - Comics'},

    {id: 'Marvel Comics', desc: 'Marvel - Comics'},

  ];

  constructor(
    private heroesService: HeroesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackbar: MatSnackBar,
  ) {}

  get currentHero(): Hero {
    const hero = this.heroForm.value as Hero;
    return hero;
  }

  ngOnInit(): void {
    if ( !this.router.url.includes('edit') ) return;

    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.heroesService.getHeroById(id) ),
      ).subscribe( hero => {
        if ( !hero ) {
          return this.router.navigateByUrl('/');
        }

        this.heroForm.reset( hero );
        return;
      });
  }

  onSubmit(): void {
    if ( this.heroForm.invalid ) return;

    if ( this.currentHero.id ) {
      this.heroesService.updateHero( this.currentHero )
        .subscribe( hero => {
          this.showSnackbar(`${ hero.superhero } updated!`)
        });

       return;
    }

    this.heroesService.addHero( this.currentHero )
      .subscribe( hero => {
        // TODO: mostrar snackbar, y navegar a /heroes/edit/ hero.id
        this.router.navigate(['/heroes/edit', hero.id ]);
        this.showSnackbar(`${ hero.superhero } updated!`);
      })

  }

  onDeleteHero() {
    if ( !this.currentHero.id ) throw Error('Hero id is required')

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: this.heroForm.value
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log({result})
    });
  }

  showSnackbar( message: string ): void {
    this.snackbar.open( message, 'done', {
      duration: 2500,
    })
  }

}
