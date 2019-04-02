import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import DatoCmsPlugin from 'datocms-plugins-sdk';
import {FormBuilder, FormGroup} from '@angular/forms';

interface IOption {
    sortOrderDescending: boolean;
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    @ViewChild('tagInput') tagInputRef: ElementRef;
    public tags: string[] = [];
    public form: FormGroup;

    public fieldName: string;
    public options: IOption = <IOption> { sortOrderDescending: false };
    public plugin: any;

    constructor(private fb: FormBuilder) {
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            tag: [undefined],
        });
        DatoCmsPlugin.init((plg) => {
            this.plugin = plg;
            this.plugin.startAutoResizer();

            this.fieldName = this.plugin.field.attributes.label;

            const currentValue = this.plugin.getFieldValue(this.plugin.fieldPath);
            this.tags = (currentValue && currentValue !== '') ? currentValue.split(',') : [];
            console.log(this.tags);

            this.options.sortOrderDescending = this.plugin.parameters.instance.sortOrderDescending;
        });
    }

    focusTagInput() {
        this.tagInputRef.nativeElement.focus();
    }

    removeTag(tag?: string) {
        if (tag) {
            const index = this.tags.indexOf(tag, 0);
            if (index > -1) {
                this.tags.splice(index, 1);
                this.plugin.setFieldValue(this.plugin.fieldPath, this.tags.join(','));
            }
        }
    }

    addTag(tag: string): void {
        if (tag.length > 0 && (this.tags.indexOf(tag, 0) === -1)) {
            this.tags.push(tag.replace(/,/g, '').trim());
            const indexEmptyTag = this.tags.indexOf('', 0);
            if (indexEmptyTag > -1) {
                this.tags.splice(indexEmptyTag, 1);
            }
            this.tags.sort();
            if (this.options.sortOrderDescending) {
                this.tags.reverse();
            }
            this.plugin.setFieldValue(this.plugin.fieldPath, this.tags.join(','));
        }
    }

    onKeyUp(event: KeyboardEvent) {
        const inputValue: string = this.form.controls.tag.value;
        if (event.code === 'Backspace' && !inputValue) {
            this.removeTag();
            return;
        } else {
            if (event.code === 'Comma' || event.code === 'Space' || event.code === 'Enter' || event.code === 'NumpadEnter') {
                this.addTag(inputValue);
                this.form.controls.tag.setValue('');
            }
        }
    }
}
